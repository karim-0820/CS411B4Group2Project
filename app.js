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