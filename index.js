const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const AWS = require('aws-sdk')

const BUCKET_NAME = "nesbit-music-app"
const TABLE_NAME = "music"

const app = express();
const port = 3000;
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var s3 = new AWS.S3({
    region: "us-east-1",
    Bucket: BUCKET_NAME
});

AWS.config.update({
    region: "us-east-1"
});

var dynamodb = new AWS.DynamoDB.DocumentClient();

let params = {
    Bucket: BUCKET_NAME
}

var library = {};


app.get('/genres', (req,res) => {
    var genres = scan("Genres");
    res.send(genres);
});

app.get('/artists/for/genre', (req, res) => {
    var genre = req.query.genre;
    var artists = scan(genre);
    res.send(artists);
});

app.get('albums/for/artist', (req, res) => {
    var artist = req.query.artist;
    var albums = scan(artist);
    res.send(albums);
});

function scan(scanKey) {
    var resultArray = []

    var params = {
        TableName : "music",
        FilterExpression: "PK = :scanValue",
        ExpressionAttributeValues: {
            ":scanValue": scanKey
        }
    };

    dynamodb.scan(params, function(err, data) {
        if(err) console.log(err, err.stack);
        else {
            console.log(data);
            data.Items.forEach((i) => {
                console.log(i.SK);
                resultArray.push(i.SK);
            })
            console.log(resultArray);
        }
    })

    return resultArray;
}

app.get('/listEverything', (req, res) => {
    s3.listObjectsV2(params, function(err,data) {
        if (err) {
            console.log(err);
        }
        else {
            data.Contents.forEach((i) => {
                if (i.Size != 0) {
                    var songListing = i.Key.split("/");
                    var href = this.request.httpRequest.endpoint.href;
                    var bucketUrl = href + BUCKET_NAME + "/";
                    var songKey = i.Key;
                    var songUrl = bucketUrl + encodeURIComponent(songKey);
                    fillLibrary(library, songListing, songUrl);
                }
            });
            res.send(library);
        }
    })
});

function fillLibrary(songLibrary, artistAlbumSong, songURL) {
    lastKeyIndex = artistAlbumSong.length-1;
    for (var i = 0; i < lastKeyIndex; ++i) {
        key = artistAlbumSong[i];
        if (!(key in songLibrary)){
        songLibrary[key] = {}
        }
        songLibrary = songLibrary[key];
    }
    songLibrary[artistAlbumSong[lastKeyIndex]] = songURL;
}


app.listen(port, () => console.log(`Music app listening on port ${port}!`))