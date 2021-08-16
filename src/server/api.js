// Simple Express server setup to serve for local testing/dev API server
const compression = require('compression');
const helmet = require('helmet');
const express = require('express');
const path = require('path');

const app = express();
app.use(helmet());
app.use(compression());

const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3002;
const DIST_DIR = './dist';

app.use(express.static(DIST_DIR));

const WORDSLIST = require('./wordsList.js');

app.get(/^(?!\/api).+/, (req, res) => {
    res.sendFile(path.resolve(DIST_DIR, 'index.html'));
});

app.get('/api/getletters', (req, res) => {
    const { id } = req.query;
    const wordsList = WORDSLIST.filter((el) => {
        // eslint-disable-next-line eqeqeq
        return el.id == id;
    });
    res.json(wordsList);
});

app.listen(PORT, () =>
    console.log(
        `✅  API Server started: http://${HOST}:${PORT}/api/v1/endpoint`
    )
);
