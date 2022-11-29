// Calling all the required libraries and modules
const express = require("express");

const axios = require('axios');

const { appendFile } = require("fs");

const app = express();

const cors = require('cors');
app.use(cors({
  origin: '*'
}));

const { response } = require("express");
const { get } = require("http");


// Code for generating links to random objects in the MET API
const API_URL = 'https://collectionapi.metmuseum.org/public/collection/v1/objects/';

var total = 65563; // working with a smaller library until auto-looping is up and running

function getRandomObjectURL() {
    return API_URL.concat((Math.floor(Math.random() * total)).toString());
}

function getArt(res) {
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

        // If valid object, send data to frontend. Else, retry
        if (publicDomain == true && solution != "") {
          var package = {"image":imageURL, "solution":solution}
          res.send(package);
          console.log("Valid artwork requested, sent the following:");
          console.log(package);
        } else {
          console.log("Invalid artwork, retrying.");
          getArt(res);
        }                
    })

    // Error catching, mostly for calling invalid object ID's
    .catch(error => {
      console.log("Invalid MET Request, retrying.");
      getArt(res);
    });
  } while (publicDomain == false || solution == "");
}

// Code for receiving get requests from frontend, making calls to API, and passing on valid info back to frontend 
app.get("/", function (req, res) {
  getArt(res);
});

app.listen(3000, function () {
  console.log("Server is listening on localhost:3000");
});