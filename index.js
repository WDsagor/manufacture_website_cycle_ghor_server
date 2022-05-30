const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
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
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SEC, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
};

async function run() {
  try {
    await client.connect();
    const productCollection = client.db("cycle_ghor").collection("products");
    const orderCollection = client.db("cycle_ghor").collection("orders");
    const userCollection = client.db("cycle_ghor").collection("users");

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
    app.get("/orders", verifyToken, async (req, res) => {
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
    app.get("/myorders/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const order = await orderCollection.find(query).toArray();
      res.send(order);
    });
    app.get("/users", verifyToken, async (req, res) => {
      const query = {};
      const allUser = await userCollection.find(query).toArray();
      res.send(allUser);
    });
    app.get('/admin/:email', verifyToken, async(req, res) =>{
      const email =req.params.email;
      const user = await userCollection.findOne({email: email});
      const isAdmin = user.role === 'admin';
      res.send({admin: isAdmin})
    })
    //post API---------
    app.post("/products/:id", async (req, res) => {
      const product = req.body;
      const result = await orderCollection.insertOne(product);
      
      res.send({
        success: true,
        message: `Successfully Ordered ${product.itemName}!`,
      });
    });
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateUser = {
        $set: user,
      };
      const result = await userCollection.updateOne(
        filter,
        updateUser,
        options
      );
      const accessToken = jwt.sign(
        { email: email },
        process.env.ACCESS_TOKEN_SEC,
        { expiresIn: "3h" }
      );
      res.send({ result, accessToken });
    });
    app.post("/add-product", async (req, res) => {
      const product = req.body;
      const result = await productCollection.insertOne(product);
      res.send({
        success: true,
        message: `Successfully added ${product.name}!`,
      });
    });

    app.put("/user/admin/:email",verifyToken, async (req, res) => {
      const email = req.params.email;
      const requester = req.decoded.email;
      const requesterAccount = await userCollection.findOne({email:requester});
      if(requesterAccount.role === 'admin'){

        const filter = { email: email };
        const updateUser = {
          $set: { role: "admin" },
        };
        const result = await userCollection.updateOne(filter, updateUser);
        console.log(result);
        res.send(result);
      }
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
