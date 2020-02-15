const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get('/', (req, res) => {
    res.send('Hello World, from express');
});

app.get('/shit', (req, res) => {
    res.send('this a test');

});
app.listen(port, () => console.log(`Hello world app listening on port ${port}!`))