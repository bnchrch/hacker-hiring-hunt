/* jshint node: true */
'use strict';


////////////////////////////////////////////////////////////////////////////////
// REQUIRE
////////////////////////////////////////////////////////////////////////////////


var querystring = require('querystring');
var request = require('request');


////////////////////////////////////////////////////////////////////////////////
// CONSTANTS
////////////////////////////////////////////////////////////////////////////////


/**
 * Max number of hits (results) for a query - set by Algolia
 */
var MAX_HITS_PER_PAGE = '1000';


/**
 * Request types
 */
var TYPE_ITEM = 'items';
var TYPE_USER = 'users';
var TYPE_SEARCH = 'search';
var TYPE_SEARCH_BY_DATE = 'search_by_date';


////////////////////////////////////////////////////////////////////////////////
// HELPER FUNCTIONS                                                           
////////////////////////////////////////////////////////////////////////////////


/**
 * Generate the numeric filter
 *
 * @param caller What is the name of the calling function?
 * @param marker What is the date range marker?
 */
function numericFilters(caller, marker) {
  var sym = '=';
  switch (caller) {
    case 'before':
      sym = '<' + sym;
      break;
    case 'since':
      sym = '>' + sym;
      break;
  }

  // Don't set a timestamp incase of forever, better performance
  var nf = (marker === 'forever') ? '' : 
                                    'created_at_i' + sym + timestamp(marker);
  return nf;
}


/**
 * Generate Unix timestamp based on date range marker. Based on Algolia's own
 * hnsearh.js. See repo for more: https://github.com/algolia/hn-search
 */
function timestamp(marker) {
  var now = new Date(); 
  var now_utc = Date.UTC(now.getUTCFullYear(),
                         now.getUTCMonth(),
                         now.getUTCDate(),
                         now.getUTCHours(),
                         now.getUTCMinutes(),
                         now.getUTCSeconds()) / 1000;
  
  switch (marker) {
    case 'past_24h':
      return (now_utc - (24 * 60 * 60));
    case 'past_week':
      return (now_utc - (7 * 24 * 60 * 60));
    case 'past_month':
      return (now_utc - (30 * 24 * 60 * 60));
  }
}


////////////////////////////////////////////////////////////////////////////////
// MODULE.EXPORT 
////////////////////////////////////////////////////////////////////////////////


var hn = function () {
 
  this.type = TYPE_SEARCH;
  this.params = { hitsPerPage: '', tags: [ ] };
  this.tags_or = [ ];
  this.tags_and = [ ];


  // Make HTTP request
  this.call = function (cb) {
    this.params.hitsPerPage = MAX_HITS_PER_PAGE;


    // Build the tags that will be logically OR'ed 
    if (this.tags_or.length > 0) {
      this.params.tags.push('(' + this.tags_or.toString() + ')');
    }

    // Build the tags that will be logically AND'ed
    if (this.tags_and.length > 0) {
      this.params.tags.push(this.tags_and.toString());
    }

    // Final tag param for querystring
    this.params.tags = this.params.tags.toString();


    // Build querystring
    var query = 'https://hn.algolia.com/api/v1/' + this.type;
    var query_args = querystring.stringify(this.params);

    if (this.params.tags.length > 0) query += '?' + query_args;
    if (this.type === TYPE_ITEM || this.type === TYPE_USER) {
      // In this case, there are no query_args
      query = query + '/' + this.id;
    }

    // Reset hn object attributes before request is made
    this.type = TYPE_SEARCH;
    this.params = { hitsPerPage: '', tags: [ ] };
    this.tags_or = [ ];
    this.tags_and = [ ];

   
    // Now make acutal HTTP request
    request(query, function (error, response, body) {
      if (!error && response.statusCode != 200) { 
        error = response.statusCode;
      }

      if (typeof body !== 'undefined') {
        try {
          body = JSON.parse(body);
        } catch (ex) {
          if (!error) error = ex;
        }
      }

      cb(error, body);
    });
  };
};
module.exports = new hn();


////////////////////////////////////////////////////////////////////////////////
// PROTOTYPE METHOD CHAINING 
////////////////////////////////////////////////////////////////////////////////


var FUNCTIONS_TAG = ['story',
                     'comment',
                     'poll',
                     'pollopt',
                     'show_hn',
                     'ask_hn',
                     'author'];
FUNCTIONS_TAG.forEach(function (fName) {
  hn.prototype[fName] = function (id) {

    if (arguments.length === 1 && (fName === 'author' || fName === 'story')) {
      // Have an arg to deal with, either the author (username) or story id
      this.tags_and.push(fName + '_' + id);
    }
    else {
      this.tags_or.push(fName);
    }

    return this;
  };
});


var FUNCTIONS_FILTER = ['top','recent'];
FUNCTIONS_FILTER.forEach(function (fName) {
  hn.prototype[fName] = function (cb) {
    
    switch (fName) {
      case 'top':
        this.type = TYPE_SEARCH;
        break;
      case 'recent':
        this.type = TYPE_SEARCH_BY_DATE;
        break;
    }

    if (arguments.length === 1 && typeof cb === 'function') {
      // Method chaining has stopped, can execute call
      this.call(cb);
    }
    else {
      return this;
    }
  };
});


var FUNCTIONS_TIME = ['since','before'];
FUNCTIONS_TIME.forEach(function (fName) {
  hn.prototype[fName] = function (marker, cb) {
    this.type = TYPE_SEARCH_BY_DATE;
    this.params.numericFilters = numericFilters(fName, marker);

    if (arguments.length === 2 && typeof cb === 'function') {
      this.call(cb);
    }
    else {
      return this;
    }
  };
});


hn.prototype.search = function (query, cb) {
  this.params.query = query; 

  if (arguments.length === 2 && typeof cb === 'function') {
    this.call(cb);
  }
  else {
    return this;
  }
};


// Persists from one request to another
hn.prototype.hitsPerPage = function (n) {
    if (typeof n !== 'number') { console.log('n is NaN'); return; }
    if (n % 1 !== 0) { console.log('n must be an integer'); return; }
    if (n > 1000 || n < 1) { console.log('1 <= n <= 1000'); return; }
   
    MAX_HITS_PER_PAGE = n;
    return this;
};


hn.prototype.page = function (n) {
    if (typeof n !== 'number') { console.log('n is NaN'); return; }
    if (n % 1 !== 0) { console.log('n must be an integer'); return; }
    if (n < 0) { console.log('0 <= n'); return; }

    this.params.page = n;
    return this;
};


////////////////////////////////////////////////////////////////////////////////
// PROTOTYPE NON-CHAINABLE METHODS 
////////////////////////////////////////////////////////////////////////////////


// These are by definition non-chainable
var FUNCTIONS_SINGLE = ['item','user'];
FUNCTIONS_SINGLE.forEach(function (fName) {
  hn.prototype[fName] = function (id, cb) {

    switch (fName) {
      case 'item':
        this.type = TYPE_ITEM;
        break;
      case 'user':
        this.type = TYPE_USER;
        break;
    }

    this.id = id;
    this.call(cb);
  };
});
