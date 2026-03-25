const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.fh8zolv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create client
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let jewelleryCollection;

async function run() {
  try {
    await client.connect();

    const db = client.db("jewelleryDB"); // DB name
    jewelleryCollection = db.collection("jewelleries"); // Collection name

    console.log("✅ Connected to MongoDB");

    // ✅ GET all jewelleries
    app.get("/jewelleries", async (req, res) => {
      try {
        const result = await jewelleryCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.error("❌ Error fetching data:", error);
        res.status(500).send({ message: "Failed to fetch jewelleries" });
      }
    });

  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
  }
}

run(); 

// Root route
app.get("/", (req, res) => {
  res.send("Jewellery Server Running 💎");
});

app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});