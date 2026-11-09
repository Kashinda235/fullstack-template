
const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (req, res) => {
  res.json({
    service: "web",
    status: "healthy"
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Web application running on port ${PORT}`);
  console.log(`Running on: http://localhost:${PORT}`);
});
