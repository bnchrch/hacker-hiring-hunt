var https = require('https');
var async = require('async');
var request = require('request');
var fs = require('fs');

var urls = [
    '/api/v1/search?hitsPerPage=1&tags=(comment)',
    '/api/v1/search_by_date?hitsPerPage=1&tags=(comment)',
    '/api/v1/search?hitsPerPage=1&tags=(poll)',
    '/api/v1/search_by_date?hitsPerPage=1&tags=(poll)',
    '/api/v1/search?hitsPerPage=1&tags=(story%2Cpoll)',
    '/api/v1/search_by_date?hitsPerPage=1&tags=(story%2Cpoll)',
    '/api/v1/search?hitsPerPage=1&tags=(story)',
    '/api/v1/search_by_date?hitsPerPage=1&tags=(story)',
    '/api/v1/items/17',
    '/api/v1/users/pg',
    '/api/v1/search?hitsPerPage=1&tags=(comment)%2Cauthor_pg',
    '/api/v1/search_by_date?hitsPerPage=1&tags=(comment)%2Cauthor_pg',
    '/api/v1/search?hitsPerPage=1&tags=(poll)%2Cauthor_pg',
    '/api/v1/search_by_date?hitsPerPage=1&tags=(poll)%2Cauthor_pg',
    '/api/v1/search?hitsPerPage=1&tags=(story)%2Cauthor_pg',
    '/api/v1/search_by_date?hitsPerPage=1&tags=(story)%2Cauthor_pg',
    '/api/v1/search?hitsPerPage=1&tags=(comment)&query=apple',
    '/api/v1/search_by_date?hitsPerPage=1&tags=(comment)&query=apple',
    '/api/v1/search?hitsPerPage=1&tags=(poll)&query=apple',
    '/api/v1/search_by_date?hitsPerPage=1&tags=(poll)&query=apple',
    '/api/v1/search?hitsPerPage=1&tags=(story%2Cpoll)&query=apple',
    '/api/v1/search_by_date?hitsPerPage=1&tags=(story%2Cpoll)&query=apple',
    '/api/v1/search?hitsPerPage=1&tags=(story)&query=apple',
    '/api/v1/search_by_date?hitsPerPage=1&tags=(story)&query=apple',
    '/api/v1/search?hitsPerPage=1&tags=(ask_hn)&page=2&query=apple',
    '/api/v1/search_by_date?hitsPerPage=1&tags=(ask_hn)&page=2&query=apple'
];

async.mapSeries(urls, function(item, next) {
  request.get('https://hn.algolia.com' + item, function(err, response, body) {
    next(err, {
      url: item,
      reply: JSON.parse(body)
    });
  });
}, function(err, results) {
  if(err) {
    console.err("Bad news: " + err);
    process.exit();
  }
  fs.writeFileSync("./fixtures.json", JSON.stringify(results));
  console.log("Wrote fixtures.json!");
});
