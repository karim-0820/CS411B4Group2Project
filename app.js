const express = require("express");

const axios = require('axios');

const { appendFile } = require("fs");

const app = express();

const cors = require('cors');
app.use(cors({
  origin: '*'
}));


const { response } = require("express");

const API_URL = 'https://collectionapi.metmuseum.org/public/collection/v1/objects/';

var total = 512;

function getRandomObjectID() {
    return Math.floor(Math.random() * total);
}

function getRandomObjectURL() {
    return API_URL.concat(getRandomObjectID().toString());
} 

var data;

app.get("/", function (req, res) {
  var publicDomain;
  var solution;
  var imageURL;
  do {
    console.log("Beginning get request to MET!");
    axios.get(getRandomObjectURL())
    .then(response => {
        data = response.data;
        console.log(data);
        imageURL = data.primaryImageSmall;
        solution = data.country;
        publicDomain = data.isPublicDomain;
        if (publicDomain == true && solution != "") {
          res.send({"image":imageURL, "solution":solution, "objectID":response.data.objectID, "isPublicDomain":publicDomain});
        } else {
          console.log("invalid artwork, try again");
          console.log((publicDomain == false || solution == "").toString())
        }                
    });
    console.log("End of do-while loop")
  } while (publicDomain == false || solution == "");
});

app.listen(3000, function () {
  console.log("Server is listening on localhost:3000");
});