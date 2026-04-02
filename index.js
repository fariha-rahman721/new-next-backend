const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors()); // optional, global CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // allow all origins
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Check environment variables
if (!process.env.DB_USER || !process.env.DB_PASSWORD) {
  console.error("❌ Missing DB_USER or DB_PASSWORD environment variables");
  process.exit(1);
}

// MongoDB URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.fh8zolv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create reusable MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let jewelleryCollection;
let weddingCollection;

// Main function
async function run() {
  try {
    await client.connect();
    const db = client.db("JewelleryDB");
    jewelleryCollection = db.collection("jewelleries");
    weddingCollection = db.collection("wedding");
    console.log("✅ Connected to MongoDB");

    // --- Routes ---

    // Root
    app.get("/", (req, res) => {
      res.send("Jewellery Server Running");
    });

    // Jewelleries
    app.get("/jewelleries", async (req, res) => {
      try {
        const result = await jewelleryCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching jewelleries:", error);
        res.status(500).send({ message: "Failed to fetch jewelleries" });
      }
    });

    app.get("/jewelleries/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const jewellery = await jewelleryCollection.findOne({ _id: new ObjectId(id) });
        if (!jewellery) return res.status(404).send({ message: "Jewellery not found" });
        res.send(jewellery);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Invalid ID" });
      }
    });

    app.post("/jewelleries", async (req, res) => {
      try {
        const newJewellery = req.body;
        const exists = await jewelleryCollection.findOne({ id: newJewellery.id });
        if (exists) return res.status(400).send({ message: "Jewellery with this ID already exists" });

        const result = await jewelleryCollection.insertOne(newJewellery);
        res.status(201).send(result);
      } catch (error) {
        console.error("Error adding jewellery:", error);
        res.status(500).send({ message: "Failed to add jewellery" });
      }
    });

    // Wedding
    app.get("/wedding", async (req, res) => {
      try {
        const data = await weddingCollection.find().toArray();
        res.send(data);
      } catch (error) {
        console.error("Error fetching wedding data:", error);
        res.status(500).send({ error: "Failed to fetch wedding data" });
      }
    });

    app.post("/wedding", async (req, res) => {
      try {
        const newItem = req.body;
        const result = await weddingCollection.insertOne(newItem);
        res.send({
          message: "Data inserted successfully",
          insertedId: result.insertedId,
        });
      } catch (error) {
        console.error("Error inserting wedding data:", error);
        res.status(500).send({ error: "Failed to insert wedding data" });
      }
    });

  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

run();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});