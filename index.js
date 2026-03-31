const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

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

        const db = client.db("JewelleryDB");
        jewelleryCollection = db.collection("jewelleries");
        weddingCollection = db.collection("wedding");

        console.log("Connected to MongoDB");

        // GET all jewelleries
        app.get("/jewelleries", async (req, res) => {
            try {
                const result = await jewelleryCollection.find().toArray();
                res.send(result);
            } catch (error) {
                console.error("Error fetching data:", error);
                res.status(500).send({ message: "Failed to fetch jewelleries" });
            }
        });

        // GET jewellery by ID
        const { ObjectId } = require("mongodb");

        app.get("/jewelleries/:id", async (req, res) => {
            try {
                const id = req.params.id;

                const jewellery = await jewelleryCollection.findOne({
                    _id: new ObjectId(id),
                });

                if (!jewellery) {
                    return res.status(404).send({ message: "Jewellery not found" });
                }

                res.send(jewellery);
            } catch (error) {
                console.error(error);
                res.status(500).send({ message: "Invalid ID" });
            }
        });

        // POST a new jewellery
        app.post("/jewelleries", async (req, res) => {
            try {
                const newJewellery = req.body;


                const exists = await jewelleryCollection.findOne({ id: newJewellery.id });
                if (exists) {
                    return res.status(400).send({ message: "Jewellery with this ID already exists" });
                }

                const result = await jewelleryCollection.insertOne(newJewellery);
                res.status(201).send(result);
            } catch (error) {
                console.error("Error adding jewellery:", error);
                res.status(500).send({ message: "Failed to add jewellery" });
            }
        });


        // get wedding collection
        app.get("/wedding", async (req, res) => {
            try {
                const data = await weddingCollection.find().toArray();
                res.send(data);
            } catch (error) {
                res.status(500).send({ error: "Failed to fetch data" });
            }
        });



        
        // post wedding collection

        app.post("/wedding", async (req, res) => {
            try {
                const newItem = req.body;

                const result = await weddingCollection.insertOne(newItem);

                res.send({
                    message: "Data inserted successfully",
                    insertedId: result.insertedId,
                });
            } catch (error) {
                res.status(500).send({ error: "Failed to insert data" });
            }
        });






    } catch (error) {
        console.error("MongoDB connection error:", error);
    }
}

run();

// Root route
app.get("/", (req, res) => {
    res.send("Jewellery Server Running");
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});