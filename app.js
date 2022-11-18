const express = require("express");

const axios = require('axios');

const { appendFile } = require("fs");

const app = express();

const cors = require('cors');
const { response } = require("express");
app.use(cors({
  origin: '*'
}));

const API_URL = 'https://collectionapi.metmuseum.org/public/collection/v1/objects/';

var total = 482855;

function getRandomObject(max) {
    return Math.floor(Math.random() * max);
}

var random_object = getRandomObject(total).toString();

var object_data = API_URL.concat(random_object);

var data;

// make a variable for the isPublicDomain property
// var isPublicDomain = response.data.isPublicDomain;

// if is publicDomain is false, then get a new random object
/*
while (isPublicDomain == false) {
    getRandomObject(total);
}
*/


app.get("/", function (req, res) {
  axios.get('https://collectionapi.metmuseum.org/public/collection/v1/objects/234')
    .then(response => {
        data = response.data;
        console.log(data);
        var imageURL = data.primaryImageSmall;
        var solution = data.country;
        res.send({"image":imageURL, "solution":solution, "ispublicdomain":response.data.objectID});
    })
  
});

app.listen(3000, function () {
  console.log("Server is listening on localhost:3000");
});