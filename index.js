const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const AWS = require('aws-sdk')

const app = express();
const port = 3000;
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var s3 = new AWS.S3({
    region: "us-east-1",
    Bucket: "nesbit-music-app"
});

let params = {
    Bucket: "nesbit-music-app"
}

app.get('/', (req, res) => {
    res.send('Bullshit, from express');
});

app.get('/shit', (req, res) => {

    library = [];

    s3.listObjectsV2(params, function(err,data) {
        if (err) {
            console.log(err);
        }
        else {
            data.Contents.forEach((i) => {
                if (i.Size != 0) {
                    var val = i.Key.split("/");
                    // var artist = val[0];
                    // var album = val[1];
                    // var song = val[2];
                    library.push(val)
                }
                // console.log(i);
                // res.send(i);
            });
            console.log(library);
            res.send(library);
        }
    })
});


app.listen(port, () => console.log(`Music app listening on port ${port}!`))