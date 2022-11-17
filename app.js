const express = require("express");
const axios = require("axios");
const { appendFile } = require("fs");
const {response} = require("express");

const app = express();

const API_URL = 'https://collectionapi.metmuseum.org/public/collection/v1/objects/';

var total = 482855;

function getRandomObject(max) {
    return Math.floor(Math.random() * max);
}

var random_object = getRandomObject(total).toString();

var object_data = API_URL.concat(random_object);

axios.get(object_data)
    .then(response => {
        console.log(response.data);
    })

// make a variable for the isPublicDomain property
var isPublicDomain = response.data.isPublicDomain;

// if is publicDomain is false, then get a new random object
while (isPublicDomain == false) {
    getRandomObject(total);
}


app.get("/", function (req, res) {
  res.send({"image":"https://images.metmuseum.org/CRDImages/ad/web-large/DP263972.jpg", "solution":"United States"});
});

app.listen(3000, function () {
  console.log("Server is listening on localhost:3000");
});

