
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const {
    redisClient,
    connectRedis
} = require("./redis");

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

    // Connect to Redis
    await connectRedis();
    console.log("Connected to Redis.")

    // Select database and collection
    const db = client.db("tempo");
    const usersCollection = db.collection("users");

    // Home route
    app.get("/", (req, res) => {
      res.send("API is running");
    });

    // Get all users from Redis -> MongoDB
    app.get("/api/users", async (req, res) => {
        try {
            const cacheKey = "users:all";
            const cachedUsers = await redisClient.get(cacheKey);

            if (cachedUsers) {
                console.log("CACHE HIT");

                return res.json({
                    source: "redis",
                    data: JSON.parse(cachedUsers)
                });
            }
            console.log("CACHE MISS");
            const users = await usersCollection.find({}).toArray();

            // Save in Redis for 60 seconds
            await redisClient.setEx(
                cacheKey,
                60,
                JSON.stringify(users)
            );

            res.json({
                source: "mongodb",
                data: users
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({
                error: "Internal server error \nFailed to fetch users"
            });
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
        await redisClient.del("users:all");

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
