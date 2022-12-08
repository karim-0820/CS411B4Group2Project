// Calling all the required libraries and modules, express config 
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const axios = require('axios');

const { appendFile } = require("fs");

const cors = require('cors');
app.use(cors({
  origin: '*'
}));
const {MongoClient} = require('mongodb');
const uri = "mongodb+srv://karim0820:ILJIqia1jsQk7X5s@cluster0.ah5hs8i.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

//index route
app.get("/", function(req, res){
  res.send("ArtGuessr Streak API");
});

(async () =>{
  let client = await MongoClient.connect(
      uri,
      {useNewUrlParser : true}
  );

  db = client.db("Usernames");

  app.listen(port, async function(){
    if(db){
      console.log("Database connected");
    }
  });
})();

// route to create a new player
app.post("/players", async function(req, res){
  // get info on player from POST body data
  let {username, games_played } = req.body;

  // check if username already exists:
  const alreadyExists = await db
      .collection("players")
      .findOne({username : username});

  if (alreadyExists){
    res.send({status: false, msg: "player username already exists"});
  }else{
    // create new player in db
    await db.collections("players").insertOne({username: score});
    console.log("created player with name: ${username }");
    res.send({status: true, msg: "player created"});
  }
});

app.put("/players", async function(req, res){
  let {username, games_played} = req.body;
  // check if username already exists

  const alreadyExists = await db
      .collection("players")
      .findOne({username : username});
  if (alreadyExists){
    // update player object to games_played +1
    await db
        .collection("players")
        .updateOne({username}, {$set:{username, games_played}});
    console.log("player: ${username} games_played updated to ${score}")
    res.send({status: true, msg: "player games_played updated"});
  }else{
    res.send({status:false, msg: "player with username could not be found"})
  }
});

// access to leaderboard

app.get("/players", async function(req, res){
  let {lim} = req.query;
  db.collection("players")
      .find()
  // -1 for descending
      .sort({games_played: -1})
      .limit(lim)
      .toArray(function(err, result){
        if(err)
          res.send({status:false, msg: "failed to retrieve players"});
        console.log(Array.from(result));
        res.send({status:true, msg: result})
      });
});


var output_str = "";

async function run() {
  try {
    const database = client.db('');
    const movies = database.collection('movies');
    // Query for a movie that has the title 'Back to the Future'
    const query = { title: 'Back to the Future' };
    const movie = await movies.findOne(query);
    console.log(movie);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

// const uri = "mongodb+srv://karim0820:ILJIqia1jsQk7X5s@cluster0.ah5hs8i.mongodb.net/?retryWrites=true&w=majority";
//
// const client = new MongoClient(uri);
//
// import { MongoClient } from "mongodb";
//
// // Replace the uri string with your MongoDB deployment's connection string.
// const uri = "<connection string uri>";
//
// const client = new MongoClient(uri);
//
// async function run() {
//   try {
//     const database = client.db("sample_mflix");
//     const movies = database.collection("movies");
//
//     // create a filter for a movie to update
//     const filter = { title: "Random Harvest" };
//
//     // this option instructs the method to create a document if no documents match the filter
//     const options = { upsert: true };
//
//     // create a document that sets the plot of the movie
//     const updateDoc = {
//       $set: {
//         plot: `A harvest of random numbers, such as: ${Math.random()}`
//       },
//     };
//
//     const result = await movies.updateOne(filter, updateDoc, options);
//     console.log(
//         `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
//     );
//   } finally {
//     await client.close();
//   }
// }
// run().catch(console.dir);



// async function main() {
//   const uri = "mongodb+srv://karim0820:ILJIqia1jsQk7X5s@cluster0.ah5hs8i.mongodb.net/?retryWrites=true&w=majority";
//   const client = new MongoClient(uri, {useNewUrlParser: true} );
//   client.connect( err => {
//     const collection = client.db("test").collection("devices");
//
//     // perform actions on the collection object
//     client.close();
//   });
// }

const { response } = require("express");
const { get } = require("http");

// Code for generating links to random objects in the MET API
const API_URL = 'https://collectionapi.metmuseum.org/public/collection/v1/objects/';

var total = 65563; // working with a smaller library until auto-looping is up and running

function getRandomObjectURL() {
    return API_URL.concat((Math.floor(Math.random() * total)).toString());
}

/* Define for a library of values used for game balance. 
  A value indicates a weight on a country's likelihood of being selected. 
  All values must be between 0 and 1 (inclusive). Default value is 1.
  Accompanying function is for processing weights.
*/

var Balance = {
  "United States": 0.1,
  "Japan": 0.25,
  "France": 0.9
}; 

function reroll(country) {
  var weight = Balance[country];
  var die = (1 / weight) - 1;
  var roll = Math.floor((Math.random() * die))
  if (roll == 0) {
    return false;
  } else {
    return true;
  }
};

// Function for checking if a solution is actually usable for the game
function isCountry(country) {
  country = country.toLowerCase();
  if (country.includes("probably") || country.includes(" or ") || country.includes("maybe") || country == "" || country.includes("possibly")) {
    return false;
  } else {
    return true;
  }
}

// Function and array for fixing common disconnects between MET and geocoding data
var needReassignment = [
  "England",
  "Scotland",
  "Ottoman Empire",
  "North India",
  "South India",
  "Tibet"
]

function reassignCountry(country) {
  if (country == "England" || country == "Scotland") {
    return "United Kingdom";
  } else if (country == "Ottoman Empire") {
    return "Turkey";
  } else if (country == "North India" || country == "South India") {
    return "India";
  } else if (country == "Tibet") {
    return "China";
  } else {
    return country;
  }
}


function getArt(req, res) {
  // Initializations for variables used in making and responding to requests
  var publicDomain;
  var solution;
  var imageURL;
  var data;

  // GET request to MET and response to frontend  
  do {
    axios.get(getRandomObjectURL())
    .then(response => {

        // Storing useful data
        data = response.data;
        imageURL = data.primaryImageSmall;
        solution = data.country;
        publicDomain = data.isPublicDomain;

        if (needReassignment.includes(solution)) {
          solution = reassignCountry(solution);
        }

        // If valid object, send data to frontend. Else, retry
        if (publicDomain == false || isCountry(solution) == false) {
          // Failure, retry
          console.log("Invalid artwork, retrying.");
          getArt(req, res);
        } else if (solution in Balance) {
          // Has a chance to reroll a valid artwork based on weights defined in Balance
          if (reroll(solution)) {
            console.log("Rerolling");
            getArt(req, res);
          } else {
            console.log("Winner, winner!")
            // Success via reroll
            var package = {"image":imageURL, "solution":solution};
            res.send(package);
            console.log("Valid artwork requested, sent the following:");
            console.log(package);
            console.log(req.body.username);
          }
        } else {
          // Success
          var package = {"image":imageURL, "solution":solution};
          res.send(package);
          console.log("Valid artwork requested, sent the following:");
          console.log(package);
          console.log(req.body.username);

          // increment the number of times the user has played

        }                
    })

    // Error catching, mostly for calling invalid object ID's
    .catch(error => {
      console.log("Invalid MET Request, retrying.");
      getArt(req, res);
    });
  } while (publicDomain == false || solution == "");
}

// Code for receiving get requests from frontend, making calls to API, and passing on valid info back to frontend 
app.post("/", function (req, res) {
  getArt(req, res);
});

app.listen(3000, function () {
  console.log("Server is listening on localhost:3000");
});