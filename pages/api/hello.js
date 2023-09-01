const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = "mongodb+srv://admin:ghA3e71SEhLNWWCd@cluster0.exm6gyp.mongodb.net/?retryWrites=true&w=majority";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

export default async function handler(req, res) {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const results = await client.db("ThreadDb").collection("ThreadCollection").find({}).toArray();
    console.log("Pinged your deployment: ", results);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
  res.status(200).json({ name: 'John Doe' })
}