const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const AWS = require('aws-sdk');
const serverless = require('serverless-http');

const BUCKET_NAME = "nesbit-music-app";
const MUSIC_TABLE_NAME = "music";
const USER_TABLE_NAME = "Users";

const app = express();
const port = 3000;
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

module.exports.handler = serverless(app);

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

app.get('/', function (req, res) {
    res.send('Hello World!')
})

app.post('/uploadNewSong', async (req, res) => {
    console.log("Post Successful");
    store(req.body);
});

// app.post('/save-user', async (req, res) => {
//     var email = req.query.email;
//     var name = req.query.name;
//     var id = req.query.id;
//     saveUser(email, name, id)
//     .catch(e => {
//         console.log(e);
//         res.status(400).send('Database had a meltdown');
//     });
//     console.log("User save successful");
//     res.status(200).send('The dude abides');
// });

app.get('/genres', async (req,res) => {
    var genres = await scan("Genres");
    res.send(genres);
});

app.get('/artists/for/genre', async (req, res) => {
    var genre = req.query.genre;
    var artists = await query(genre);
    res.send(artists);
});

app.get('/albums/for/artist', async (req, res) => {
    var artist = req.query.artist;
    var albums = await query(artist);
    res.send(albums);
});

app.get('/songs/for/album', async (req, res) => {
    var album = req.query.album;
    var songs = await query(album);
    res.send(songs);
})

app.get('/song', async (req, res) => {
    var song = req.query.song;
    var url = await query(song);
    res.send(url);
})

function saveUser(email, name, id) {
    return new Promise((reolve, reject) => {
        var params = {
            TableName: USER_TABLE_NAME,
            Item: {
                "PK" : name,
                "SK" : email,
                "UID" : id
            }
        };

        dynamodb.put(params, function(err, data) {
            if (err) {
                console.log(err);
            }
            else {
                console.log(data);
            }
        })
    });
}

function store(songInfo) {

    var paramsForGenres = {
        TableName: MUSIC_TABLE_NAME,
        Item: {
            "PK" : "Genres",
            'SK' : songInfo.genre
        }
    };
    var paramsForGenre = {
        TableName: MUSIC_TABLE_NAME,
        Item: {
            'PK' : songInfo.genre,
            'SK' : songInfo.artist
        }
    };
    var paramsForArtist = {
        TableName: MUSIC_TABLE_NAME,
        Item: {
            'PK' : songInfo.artist,
            'SK' : songInfo.album
        }
    };
    var paramsForAlbum = {
        TableName: MUSIC_TABLE_NAME,
        Item: {
            'PK' : songInfo.album,
            'SK' : songInfo.song
        }
    };

    dynamodb.put(paramsForGenres, function(err, data) {
        if (err) {
            console.log("Error", err);
        } else {
            console.log("Success", data);
        }
    });
    dynamodb.put(paramsForGenre, function(err, data) {
        if (err) {
            console.log("Error", err);
        } else {
            console.log("Success", data);
        }
    });
    dynamodb.put(paramsForArtist, function(err, data) {
        if (err) {
            console.log("Error", err);
        } else {
            console.log("Success", data);
        }
    });
    dynamodb.put(paramsForAlbum, function(err, data) {
        if (err) {
            console.log("Error", err);
        } else {
            console.log("Success", data);
        }
    });
}

async function query(scanKey) {
    return new Promise( result => {
        var resultArray = [];

        var params = {
            TableName: MUSIC_TABLE_NAME,
            KeyConditionExpression: "PK = :scanValue",
            ExpressionAttributeValues: { 
                ":scanValue": scanKey
            }
        };

        dynamodb.query(params, function (err, data) {
            if (err) console.log(err);
            else{
                data.Items.forEach((i) => {
                    resultArray.push(i.SK);
                });
            // console.log("resultArray: ", resultArray);
        }

        result(resultArray);
        });
    })
}

async function scan(scanKey) {
    return new Promise( result => {
        var resultArray = []

        var params = {
            TableName : MUSIC_TABLE_NAME,
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
                // console.log(resultArray);
            }
            result(resultArray);
        })
    });
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
