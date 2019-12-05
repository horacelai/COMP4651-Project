var express = require('express');
var app = express();
const stemmer = require('stemmer');
const _ = require('lodash/core');
const tf = require('@tensorflow/tfjs-node');
var path = require("path");
var bodyParser = require('body-parser');
const db = require('./db');

const port = 3000;

const MAX_SIZE = 50;

function getTokenisedWord(seedWord) {
    const word2index = require('../utils/words.json');
    const _token = word2index[seedWord.toLowerCase()]
    return _token;
}

const vocabulary = "In an RSA cryptosystem, a particular A uses two prime numbers p = 13 and q =17 to generate her public and private keys. If the public key of A is 35. Then the private key of A is?".split(' ');

const parse = (t) => { 
    return tf.tensor1d(_.compact(t.map((w, i) => {
        return getTokenisedWord(stemmer(w)) || 0;
    })))
};

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

app.post('/signin', passport.authenticate('signin', { session: false }), (req, res) => {
    const token = jwt.sign(req.user, secret_key)
    res.json(token)
});

app.post('/', async (req, res) => {
    let tokens = parse(req.body.content.split(' '));
    let sequence = tf.pad(tokens, [[MAX_SIZE - tokens.size, 0]], 0).expandDims();
    const model = await tf.loadLayersModel('file://' + path.resolve('./utils/model/model.json'));
    let labels = ["Counting Lists, Permutations, and Subsets", 'Details of the RSA Cryptosystem', 'Propositional logic, Predicate logic, Inference and proofs', 'The Master Theorem'];
    let prediction = labels[await tf.argMax(model.predict(sequence).flatten(), [-1]).data()];
    let now;
    try{
        now = await db.query('SELECT * FROM account');
    } catch(e) {
        console.log(e);
    }
    res.json({ 'prediction': prediction, 'now': now.rows });
});

app.listen(port, () => console.log(`App listening on port ${port}!`))