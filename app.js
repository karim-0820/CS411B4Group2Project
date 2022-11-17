const express = require("express");

const bknd = express();

/*
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

*/

bknd.get("/", function (req, res) {
  res.sendFile(__dirname + "/Artguessr.html");
});

bknd.listen(3000, function () {
  console.log("Server is running on localhost3000");
});