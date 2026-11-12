
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// MongoDB connection string
const MONGO_URL =
  process.env.MONGO_URL || "mongodb://my-mongo:27017/tempo";

const client = new MongoClient(MONGO_URL);

async function startServer() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log("Connected to MongoDB!");

    // Select database and collection
    const db = client.db("tempo");
    const usersCollection = db.collection("users");

    // Home route
    app.get("/", (req, res) => {
      res.send("API is running");
    });

    // Get all users from MongoDB
    app.get("/api/users", async (req, res) => {
      try {
        const users = await usersCollection.find({}).toArray();
        res.json(users);
      } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Failed to fetch users" });
      }
    });

    // Add a new user to MongoDB
    app.post("/api/users", async (req, res) => {
      try {
        const { name, email, age } = req.body;

        if (!name || !email) {
          return res.status(400).json({
            error: "Name and email are required"
          });
        }

        const newUser = { name, email };

        if (age !== undefined) {
          newUser.age = age;
        }

        const result = await usersCollection.insertOne(newUser);

        res.status(201).json({
          _id: result.insertedId,
          ...newUser
        });
      } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Failed to create user" });
      }
    });

    app.get("/health", (req, res) => {
      res.status(200).json({
        status: "healthy",
        database: "connected"
      });
    });

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`API listening on port ${PORT}`);
      console.log(`API running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("Failed to start API:", error);
    process.exit(1);
  }
}

startServer();
