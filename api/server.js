const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to our Docker learning API!");
  res.json({
    message: "Welcome to our Docker learning API!"
  });
});

app.get("/api/users", (req, res) => {
  res.json([
    { id: 1, name: "John" },
    { id: 2, name: "Sarah" },
    { id: 3, name: "Alex" }
  ]);
});

app.get("/api/products", (req, res) => {
  res.json([
    { id: 1, name: "John" },
    { id: 2, name: "Sarah" },
    { id: 3, name: "Alex" }
  ]);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API running on port ${PORT}`);
});
