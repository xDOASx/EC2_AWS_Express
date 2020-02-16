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

var library = {};

app.get('/shit', (req, res) => {
    s3.listObjectsV2(params, function(err,data) {
        if (err) {
            console.log(err);
        }
        else {
            data.Contents.forEach((i) => {
                if (i.Size != 0) {
                    var val = i.Key.split("/");
                    assign(library, val, i.Key);
                }
            });
            res.send(library);
        }
    })
});

function assign(obj, keyPath, value) {
    lastKeyIndex = keyPath.length-1;
    for (var i = 0; i < lastKeyIndex; ++ i) {
        key = keyPath[i];
        if (!(key in obj)){
        obj[key] = {}
        }
        obj = obj[key];
    }
    obj[keyPath[lastKeyIndex]] = value;
}


app.listen(port, () => console.log(`Music app listening on port ${port}!`))