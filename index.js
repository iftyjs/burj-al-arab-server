const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

const port = 5000;
const app = express();
app.use(cors());
app.use(bodyParser.json());


// Mongo DB
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.aew8x.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Firebase JWT
const serviceAccount = require("./config/burj-al-82854-firebase-adminsdk-sbn7h-3f23839438.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.get('/', (req, res) => {
  res.send('Hellow world from node!');
})

client.connect(err => {
  const booking = client.db("burj-A-Arab").collection("booking");

  // Adding booking data on server
  app.post('/addBooking', (req, res) => {
    booking.insertOne(req.body)
    .then(result => {
      if(result.insertedCount > 0){
        res.send(req.body);
      }
    })
  })

  // get all booking info by api
  app.get('/booking', (req, res) => {
    const headerToken = req.headers.authorization;
    if( headerToken && headerToken.startsWith('Bearer')){
      const idToken = headerToken.split(" ")[1];
      admin.auth()
      .verifyIdToken(idToken)
      .then((decodedToken) => {
        const jwtEmail = decodedToken.email;
        const clientEmail = req.query.email;
        if(jwtEmail === clientEmail){
        booking.find({email: clientEmail})
          .toArray((err, doc) => {
            res.send(doc);
          })
        }
      })
      .catch((error) => {
        console.log(error);
      });
    }else{
      res.status(401).send('unauthorized access')
    }
  })

});

app.listen(port, ()=> console.log(`server listen at port ${port}`))