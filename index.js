const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("port a kiu paowa jaitese");
});




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v1nj2ca.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run() {
  try {
    await client.connect();
    const productCollection = client.db("cycle_ghor").collection("products");
    const orderCollection = client.db("cycle_ghor").collection("orders");
    
    app.get("/", (req, res) => {
      res.send("port a kiu paowa jaitese");
    });
    //Get API--------------
    app.get("/products", async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });
    app.get("/orders", async (req, res) => {
      const query = {};
      const cursor = orderCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.send(result);
    });
    //post API---------
    app.post("/products/:id", async (req, res) => {
      const product = req.body;
      const result = await orderCollection.insertOne(product);
      console.log(result);
      res.send({
        success: true,
        message: `Successfully Ordered ${product.itemName}!`,
      });
    });

    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;

      const result = await orderCollection.deleteOne({ _id: ObjectId(id) });

      if (!result.deletedCount) {
        return res.send({ success: false, error: "something went wrong" });
      }

      res.send({ success: true, message: "Successfully deleted " });
    });
    
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log("bd connected", port);
});
