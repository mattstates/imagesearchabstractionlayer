require('dotenv').config(); // process.env.VARNAME

const express = require('express');
const app = express();
const port = process.env.PORT || 7777;
const path = require('path')

const google = require('googleapis');
const customsearch = google.customsearch('v1');
let recentSearches = [];

///// Middleware /////
app.use(express.static(path.join(__dirname, 'public')));

///// Routes /////

// Home Page //
app.get('/', (req, res) => {
    res.sendFile('./public.index.html')
});

// Recent Searches //
app.get('/recent', (req, res) => {
    res.json({
        numberOfSearchesSinceAppRestart: recentSearches.length,
        recentSearchTerms: recentSearches
    })
})

// Image Search //
app.get('/api/:searchTerm', (req, res) => {
    const API_KEY = process.env.GOOGLE_API_KEY;
    const CX = process.env.GOOGLE_CX;
    const SEARCH = req.params.searchTerm;
    const offset = !!req.query.offset ? req.query.offset * 10 : 10;

    recentSearches.push(SEARCH);
    // https://github.com/google/google-api-nodejs-client/tree/master/samples/customsearch
    customsearch.cse.list({ cx: CX, q: SEARCH, auth: API_KEY, searchType: 'image', highRange: offset}, function (err, resp) {
        if (err) {
            return console.log('An error occured', err);
        }

        if (resp.items && resp.items.length > 0) {

            const imageInfo = resp.items.map( (item) => {
                return {
                    title: item.title,
                    link: item.link,
                    displayLink: item.displayLink
                }
            });

            res.json(imageInfo);
        }
    });
})

///// Server Start /////
app.listen(port, function () {
    console.log('listening on port ', port)
})