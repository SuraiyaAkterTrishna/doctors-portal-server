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
    
    await client.connect();
    // connect hoyese kina check korar jonno
    // console.log("Database connected"); 

    const serviceCollection = client.db("doctors_portal").collection("services");
    const bookingCollection = client.db("doctors_portal").collection("bookings");
    const userCollection = client.db("doctors_portal").collection("users");

    app.get('/service',async(req,res)=>{
      const query = {};
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });

    app.put('/user/:email', async(req, res)=> {
      const email = req.params.email;
      const user = req.body;
      const filter = {email: email};
      const options = {upsert: true};
      const updateDoc = {
        $set: user,
      }; 
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    })
    //Warning: for future me when I will learn more MongoDB
    //This is not the proper way to query.
    //After learning more about mongodb. Use aggregate lookup, pipeline, match, group
    app.get('/available', async(req, res)=>{
      const date = req.query.date;

      //step 1: get all services

      const services = await serviceCollection.find().toArray();

      //step 2: get the booking of that day. output: [{}, {}, {}, {}, {}, {}]
      const query = {date: date};
      const bookings = await bookingCollection.find(query).toArray();

      //step 3: for each service
      services.forEach(service => {
        // step 4: find bookings for that service. output : [{}, {}, {}]
        const serviceBookings = bookings.filter(book => book.treatment === service.name);
        //step 5: select slots for the service Bookings: ['', '', '']
        const bookedSlots = serviceBookings.map(book => book.slot);
        //step 6: select those slots that are not in booked Slots
        const available = service.slots.filter(slot => !bookedSlots.includes(slot));
        //step 7: set available to slots to make it easier
        service.slots = available;

      })

      /* recap same thing 
      services.forEach(service => {
        const serviceBookings = bookings.filter(b => b.treatment === service.name);
        const booked = serviceBookings.map(s => s.slot);
        const available = service.slots.filter(s => !booked.includes(s));
        service.available = available;

      }) */



      res.send(services);
    })

    /**
     * API Naming Convention
     * app.get('/booking') //get all booking in this collection. or get more than one or by filter
     * app.get('/booking/:id') // get a specific booking
     * app.post('/booking') // add a new booking
     * app.patch('/booking/:id') // update specific one
     * app.put('/booking/:id') //if user exists then update
     * app.delete('/booking/:id') // delete specific one
     */
    app.get('/booking', async(req, res) => {
      const patient = req.query.patient;
      const query = {patient: patient};
      const bookings = await bookingCollection.find(query).toArray();
      res.send(bookings);
    })
    app.post('/booking', async(req, res) => {
      const booking = req.body;
      const query = {treatment: booking.treatment, date: booking.date, patient: booking.patient}
      const exists = await bookingCollection.findOne(query);
      if(exists){
        return res.send({success: false, booking: exists})
      }
      const result = await bookingCollection.insertOne(booking);
      return res.send({success: true, result});
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