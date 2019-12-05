var express = require('express');
var app = express();
const stemmer = require('stemmer');
const _ = require('lodash/core');
const tf = require('@tensorflow/tfjs-node');
var path = require("path");
var bodyParser = require('body-parser');
const db = require('./db');
const passport = require('passport');

const APIKeyStrategy = require('passport-apikey').Strategy;


const port = 3000;

const MAX_SIZE = 50;

function getTokenisedWord(seedWord) {
    const word2index = require('../utils/words.json');
    const _token = word2index[seedWord.toLowerCase()]
    return _token;
}

const parse = (t) => { 
    return tf.tensor1d(_.compact(t.map((w, i) => {
        return getTokenisedWord(stemmer(w)) || 0;
    })))
};

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

passport.use('api_key', new APIKeyStrategy(async (api_key, done) => {
    try {
        let result = await db.query('SELECT id from api_key WHERE api_key = $1', [api_key]);

        if (result.rows.length > 0) {
            return done(null, result.rows[0].id);
        } else {
            return done(null, false);
        }
    } catch (e) {
        return done(null, false);
    }
}));

app.get('/topic/:id', async (req, res) => {
    const labels = ["Counting Lists, Permutations, and Subsets", 'Details of the RSA Cryptosystem', 'Propositional logic, Predicate logic, Inference and proofs', 'The Master Theorem'];
    try {
        result = await db.query('SELECT * FROM question WHERE topic = $1', [req.params.id]);
        return res.json({
            'result': result.rows.map((item) => {
                return { 'id': item.id, 'question': item.question, 'topic': labels[item.topic] }
            })
        });
    } catch (e) {
        return res.json({ 'error': true });
    }
});

app.get('/', async (req, res) => {
    const labels = ["Counting Lists, Permutations, and Subsets", 'Details of the RSA Cryptosystem', 'Propositional logic, Predicate logic, Inference and proofs', 'The Master Theorem'];
    try {
        result = await db.query('SELECT * FROM question');
        return res.json({ 'result': result.rows.map((item) => {
            return { 'id': item.id, 'question': item.question, 'topic': labels[item.topic] }
        }) });
    } catch (e) {
        return res.json({ 'error': true });
    }
});

app.post('/', passport.authenticate('api_key', { session: false }), async (req, res) => {
    const labels = ["Counting Lists, Permutations, and Subsets", 'Details of the RSA Cryptosystem', 'Propositional logic, Predicate logic, Inference and proofs', 'The Master Theorem'];
    let tokens = parse(req.body.content.split(' '));
    let exists = await db.query('SELECT question, topic FROM question WHERE tokens = $1', [tokens.arraySync().join(',')]);
    if(exists.rowCount > 0){
        return res.json({ 'prediction': labels[exists.rows[0].topic], 'result': true });
    }
    let sequence = tf.pad(tokens, [[MAX_SIZE - tokens.size, 0]], 0).expandDims();
    const model = await tf.loadLayersModel('file://' + path.resolve('./utils/model/model.json'));
    let topicId = await tf.argMax(model.predict(sequence).flatten(), [-1]).data();
    let prediction = labels[topicId];
    let result;
    try{
        result = await db.query('INSERT INTO question (question, topic, tokens, created_by) VALUES ($1, $2, $3, $4);', [req.body.content, topicId.toString(), tokens.arraySync().join(','), req.user]);
        return res.json({ 'prediction': prediction, 'result': true });
    } catch(e) {
        return res.json({ 'result': false });
    }
});

app.listen(port, () => console.log(`App listening on port ${port}!`));