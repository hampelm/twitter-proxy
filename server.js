var _ = require('lodash');
var express = require('express');
var Twit = require('twit');

var VALID_FOR = 5000;  // 5 seconds or 180 per 15 minutes
var ALLOWED_TWEETS = process.env.S3_KEY;

var T = new Twit({
  consumer_key:         process.env.KEY,
  consumer_secret:      process.env.SECRET,
  access_token:         process.env.TOKEN,
  access_token_secret:  process.env.TOKEN_SECRET
});

var app = express();

var tweets = {};

app.all('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });

function search(term, done) {
  T.get('search/tweets', { q: term, count: 100 }, function(err, data, response) {
    done(data);
  });
}

app.get('/search', function (req, res) {
  var term = req.query.term;

  console.log("Checking for query", term);

  // Check if we have a cached tweet
  console.log("checking cache", tweets);
  if (_.has(tweets, term)) {
    var cached = tweets[term];
    if (cached.created > (Date.now() - VALID_FOR)) {
      console.log("Using cache for", term);
      res.send(tweets[term].data);
      return;
    }
  }

  search(term, function(data) {
    // console.log("got data", data);
    if (data.statuses.length === 0) {
      res.send({});
      return;
    }

    var tweet = data.statuses[0];

    // console.log("Got tweet", tweet);

    tweets[term] = {
      created: Date.now(),
      data: {
        id: tweet.id_str,
        text: tweet.text,
        date: tweet.created_at,
        name: tweet.user.name,
        username: tweet.user.screen_name,
        location: tweet.user.location
      }
    };
    res.send(tweets[term]);
  });
});

var port = process.env.PORT || 3344;
var server = app.listen(port, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});

// TODO
// Whitelist terms
// function valid(term) {
//   tweets[term];
// }
//
// if(!_.has(ALLOWED_TERMS, term)) {
//   return 500;
// }
