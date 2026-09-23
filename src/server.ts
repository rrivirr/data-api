import "dotenv/config";
import app from "./app";
import config from "./infra/get-config";

const port = config.NODE_PORT || 3006;

app.listen(port, () => {
  console.log(`running on port ${port}`);
});
