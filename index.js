const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jweumb2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const foodCollection = client.db("nourish4AllDB").collection("foods");

    // load all foods
    app.get("/foods", async (req, res) => {
      const cursor = foodCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // load details of food
    app.get("/food/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodCollection.findOne(query);
      res.send(result);
    });

    // load all food sort by
    app.get("/foods-sortby", async (req, res) => {
      const cursor = foodCollection.find().sort({ expiredDateTime: 1 });
      const result = await cursor.toArray();
      res.send(result);
    });

    // add new food
    app.post("/foods", async (req, res) => {
      const newFood = req.body;
      const result = await foodCollection.insertOne(newFood);
      res.send(result);
    });

    // load my foods
    app.get("/my-foods/:email", async (req, res) => {
      const email = req.params.email;
      const query = { "donor.email": email };
      const result = await foodCollection.find(query).toArray();
      res.send(result);
    });

    // delete food
    app.delete("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodCollection.deleteOne(query);
      res.send(result);
    });

    // update food
    app.patch("/food/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedFood = req.body;
      const food = {
        $set: {
          foodName: updatedFood.foodName,
          foodImage: updatedFood.foodImage,
          foodQuantity: updatedFood.foodQuantity,
          pickupLocation: updatedFood.pickupLocation,
          expiredDateTime: updatedFood.expiredDateTime,
          additionalNotes: updatedFood.additionalNotes,
        },
      };
      const result = await foodCollection.updateOne(filter, food);
      res.send(result);
    });

    // request food
    app.patch("/request/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const requestedFood = req.body;
      const food = {
        $set: {
          foodStatus: requestedFood.foodStatus,
          additionalNotes: requestedFood.additionalNotes,
          requestDate: requestedFood.requestDate,
          benefactorEmail: requestedFood.benefactorEmail,
          benefactorName: requestedFood.benefactorName,
        },
      };
      const result = await foodCollection.updateOne(filter, food);
      res.send(result);
    });

    // load my food request
    app.get("/my-food-request/:email", async (req, res) => {
      const email = req.params.email;
      const query = { benefactorEmail: email };
      const result = await foodCollection.find(query).toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Nourish4All is running");
});
app.listen(port, () => {
  console.log(`Nourish4All is running on port : ${port}`);
});
