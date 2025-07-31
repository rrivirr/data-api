import "dotenv/config";
import app from "./app";

const port = process.env.NODE_PORT || 3006;

app.listen(port, () => {
  console.log(`running on port ${port}`);
});
