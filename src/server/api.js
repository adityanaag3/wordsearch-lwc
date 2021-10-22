// Simple Express server setup to serve for local testing/dev API server
const compression = require('compression');
const helmet = require('helmet');
const express = require('express');
const path = require('path');

// eslint-disable-next-line no-shadow
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
app.use(helmet());
app.use(compression());

const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3002;
const DIST_DIR = './dist';

app.use(express.static(DIST_DIR));

const WORDSLIST = require('./wordsList.js');

const LEADERBOARD_URL = process.env.LEADERBOARD_URL || 'http://localhost:3003';

app.get(/^(?!\/api).+/, (req, res) => {
    res.sendFile(path.resolve(DIST_DIR, 'index.html'));
});

app.get('/api/getletters', (req, res) => {
    const { id, player_name } = req.query;
    const wordsList = WORDSLIST.filter((el) => {
        // eslint-disable-next-line eqeqeq
        return el.id == id;
    });
    let letterResponse = {};
    letterResponse.wordsList = wordsList;
    if(LEADERBOARD_URL && wordsList.length > 0){
        // Post Scores to external service
        const scoreReq = {game_id: 'wordsearch_' + id, player_name: player_name};
        
        fetch(LEADERBOARD_URL + '/insertplayer',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(scoreReq)
        })
            .then((response) => response.json())
            .then((data) => {
                letterResponse.player_id = data.id;
                res.json(letterResponse);
            }).catch((e) => {
                console.error(e);
                res.json(letterResponse);
            });
    } else {
        res.json(letterResponse);
    }
});

app.post('/api/savescore', (req, res) => {
    if(LEADERBOARD_URL){
        // Post Scores to external service
        fetch(LEADERBOARD_URL + '/insertscore', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body)
        })
            .then((response) => response.json())
            .then((data) => {
                res.send(data);
            }).catch((e) => {
                console.error(e);
            });
    } else {
        res.send({"success": true});
    }
});

app.listen(PORT, () =>
    console.log(
        `✅  API Server started: http://${HOST}:${PORT}/api/v1/endpoint`
    )
);
