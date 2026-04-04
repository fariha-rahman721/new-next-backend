const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// Remove your old app.use(cors()) and manual headers, replace with this:
app.use(cors({
  origin: true, // This allows any origin that makes the request
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));


app.use(cors())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.fh8zolv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Helper to get database collections
async function getCollections() {
  await client.connect();
  const db = client.db("JewelleryDB");
  return {
    jewelleryCollection: db.collection("jewelleries"),
    weddingCollection: db.collection("wedding")
  };
}

// --- Routes ---

app.get("/", (req, res) => {
  res.send("Jewellery Server Running");
});

app.get("/jewelleries", async (req, res) => {
  try {
    const { jewelleryCollection } = await getCollections();
    const result = await jewelleryCollection.find().toArray();
    res.send(result);
  } catch (error) {
    console.error("Error:", error);
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





app.get("/wedding", async (req, res) => {
  try {
    const { weddingCollection } = await getCollections();
    const data = await weddingCollection.find().toArray();
    res.send(data);


    
  } catch (error) {
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



module.exports = app;

// Only listen if running locally
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}