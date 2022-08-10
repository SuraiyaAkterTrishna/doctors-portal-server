const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// use middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9jfyime.mongodb.net/?retryWrites=true&w=majority`;

// uri ta console.log kore dakhbo cmd te user o password ta show kore kine sure hote
// console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
  try {
    // database connect korte hobe 
    await client.connect();
    // connect hoyese kina check korar jonno
    // console.log("Database connected"); 

    const serviceCollection = client.db("doctors_portal").collection("services");

    app.get('/service',async(req,res)=>{
      const query = {};
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    })
  }
  finally {

  }

}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello from My first backend Project');
})

app.listen(port, () => {
  console.log(`Doctors Portal app listening on port ${port}`)
})