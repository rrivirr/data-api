import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
  startFakeKeycloak,
  type FakeKeycloak,
} from "./helpers/fake-keycloak";

const rows = [
  { values: { temperature: 21.5 }, time: new Date("2026-01-05T00:00:00.000Z") },
];

vi.mock("../src/service/reading.service", () => ({
  getReadingsInWindows: vi.fn(async () => rows),
}));

import app from "../src/app";
import * as readingService from "../src/service/reading.service";

let keycloak: FakeKeycloak;
let server: Server;
let baseUrl: string;

beforeAll(async () => {
  keycloak = await startFakeKeycloak(
    Number(new URL(process.env.KEYCLOAK_URL!).port),
  );
  server = app.listen(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
  await keycloak.stop();
});

beforeEach(() => vi.mocked(readingService.getReadingsInWindows).mockClear());
afterEach(() => vi.useRealTimers());

/** `verifyJwtToken` from a fresh copy of the module, so its key cache starts empty. */
const freshVerify = async () => {
  vi.resetModules();
  return (await import("../src/infra/jwt")).verifyJwtToken;
};

const body = {
  windows: [
    { eui: "E1", start: "2026-01-02T00:00:00.000Z", end: "2026-01-06T00:00:00.000Z" },
    { eui: "E2", start: "2026-01-10T00:00:00.000Z", end: null },
  ],
  limit: 50,
};

const post = (authorization: string | undefined, payload: unknown = body) =>
  fetch(`${baseUrl}/readings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(authorization && { Authorization: authorization }),
    },
    body: JSON.stringify(payload),
  });

const serviceToken = (clientId = "data-api") =>
  keycloak.issueToken({
    azp: clientId,
    sub: `svc-${clientId}`,
    preferred_username: `service-account-${clientId}`,
  });

describe("public access", () => {
  it("needs a service token for anything under /readings, and sends no CORS", async () => {
    const response = await fetch(`${baseUrl}/readings/E1`, {
      headers: { Origin: "https://app.dev.rriv.org" },
    });
    expect(response.status).toBe(401);
    expect(response.headers.get("access-control-allow-origin")).toBeNull();
  });

  it("no longer serves the old GET /readings/:eui, even to rriv-api", async () => {
    const response = await fetch(`${baseUrl}/readings/E1`, {
      headers: { Authorization: `Bearer ${await serviceToken()}` },
    });
    expect(response.status).toBe(404);
  });
});

describe("POST /readings", () => {
  it("serves readings in the given windows to the data-api service account", async () => {
    const response = await post(`Bearer ${await serviceToken()}`);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([
      { temperature: 21.5, timestamp: "2026-01-05T00:00:00.000Z" },
    ]);
    expect(readingService.getReadingsInWindows).toHaveBeenCalledWith({
      windows: [
        { eui: "E1", start: new Date("2026-01-02T00:00:00.000Z"), end: new Date("2026-01-06T00:00:00.000Z") },
        { eui: "E2", start: new Date("2026-01-10T00:00:00.000Z"), end: null },
      ],
      limit: 50,
      offset: 0,
      order: "desc",
    });
  });

  it("returns CSV as an attachment", async () => {
    const response = await post(`Bearer ${await serviceToken()}`, {
      ...body,
      format: "csv",
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toMatch(/^text\/csv/);
    expect(response.headers.get("content-disposition")).toMatch(/^attachment/);
    expect(await response.text()).toBe(
      "temperature,timestamp\n21.5,2026-01-05T00:00:00.000Z\n",
    );
  });

  it("rejects requests without a valid token (401)", async () => {
    expect((await post(undefined)).status).toBe(401);
    expect((await post("Bearer not-a-jwt")).status).toBe(401);
    const expired = await keycloak.issueToken(
      { azp: "data-api", preferred_username: "service-account-data-api" },
      { expiresIn: -60 },
    );
    expect((await post(`Bearer ${expired}`)).status).toBe(401);
    expect(readingService.getReadingsInWindows).not.toHaveBeenCalled();
  });

  it("rejects user tokens and other clients' service tokens (403)", async () => {
    const userToken = await keycloak.issueToken({
      azp: "rriv-web",
      sub: "u1",
      preferred_username: "alice",
    });
    for (const token of [userToken, await serviceToken("auth-api")]) {
      expect((await post(`Bearer ${token}`)).status).toBe(403);
    }
    expect(readingService.getReadingsInWindows).not.toHaveBeenCalled();
  });

  it("validates the body (422)", async () => {
    const token = `Bearer ${await serviceToken()}`;
    expect((await post(token, { windows: [] })).status).toBe(422);
    expect((await post(token, { ...body, limit: 100001 })).status).toBe(422);
    expect((await post(token, { ...body, extra: true })).status).toBe(422);
  });

  it("answers 503 when Keycloak's keys can't be fetched (cold cache)", async () => {
    // The app's verifier already cached keys; a fresh one has none, as after a
    // restart while Keycloak is down.
    const verify = await freshVerify();
    const token = await serviceToken();
    keycloak.setUnavailable(true);
    try {
      await expect(verify(token)).rejects.toMatchObject({ code: 503 });
    } finally {
      keycloak.setUnavailable(false);
    }
  });

  it("follows key rotation without a restart", async () => {
    const verify = await freshVerify();
    await verify(await serviceToken()); // cache the current key
    await keycloak.rotate();
    // Past jose's default 30 s cooldown between refetches.
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(Date.now() + 31_000);
    await expect(verify(await serviceToken())).resolves.toMatchObject({
      azp: "data-api",
    });
  });
});
