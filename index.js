const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var s3 = new AWS.S3({
    region: "es-east-1",
    apiVersion: "2006-03-01",
    params: { Bucket: "nesbit-music-app" }
});

app.get('/', (req, res) => {
    
    // res.send('Hello World, from express');
});

app.get('/shit', (req, res) => {
    res.send('this a test');

});
app.listen(port, () => console.log(`Music app listening on port ${port}!`))