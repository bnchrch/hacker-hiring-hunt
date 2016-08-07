# Node.js Hacker News API

A Node.js [library](https://www.npmjs.org/package/hacker-news-api) for seamless
integration with [Algolia's kickass Hacker News API](https://hn.algolia.com/api).


## Installation

```sh
npm install hacker-news-api
```

## Examples

Almost all methods are chainable, with flexible ordering. Methods are executed
(as in HTTP requests are made) once a callback function is passed (not all
  methods accept a callback). Thus, this will always be the last method in the
chain.

```js
var hn = require('hacker-news-api');

// Get recent ask_hn posts, polls, and comments
hn.ask_hn().poll().comment().recent(function (error, data) {
  if (error) throw error;
  console.log(data);
});

// Get pg's top story and show_hn posts
hn.author('pg').story().show_hn().top(function (error, data) {
  if (error) throw error;
  console.log(data);
});

// Search for comments and storys containing 'js' before the past week
hn.comment().story().search('js').before('past_week', function (error, data) {
  if (error) throw error;
  console.log(data);
});
```

## Chainable Methods

### Tags (OR'ed)

These tags are logically OR'ed when chained.

- ```ask_hn()```
- ```comment()```
- ```poll()```
- ```pollopt()```
- ```show_hn()```
- ```story()```


### Tags (AND'ed)

These tags are logically AND'ed when chained.

- ```author(username)```
- ```story(id)```


### Filters

These methods take an optional callback function.

- ```recent(cb)```
- ```top(cb)```

### Time

These methods take an optional callback function.

- ```before(marker, cb)```
- ```since(marker, cb)```

The following are valid inputs for the ```marker```
parameter:

- **'past_24h'**
- **'past_week'**
- **'past_month'**
- **'forever'**

### Search

This method takes an optional callback function.

- ```search(query, cb)```

### Settings

- ```hitsPerPage(n)```
  - _n must be an integer and 1 <= n <= 1000_
  - _Default is 1000_
  - _This setting is persistant from one request another_
- ```page(n)```
  - _n must be an integer and 0 <= n_


## Non-chainable

By definition these methods are not chainable.

- ```item(id, cb)```
  - _Get specific item_
- ```user(username, cb)```
  - _Get user profile_


## API Notes

Keep in mind that Algolia has a rate limit of 10,000 requests per hour from a
single IP. Also, requests have a max of a 1000 hits (results). By default,
```hitsPerPage``` is to this max (it is configurable however). So for example,
```author().comment().since()``` called with ```past_month``` will return
the first 1000 posts within the last month from the author (user) in question,
but there could easily be more than that. You can check this via ```nbHits```
in the returned JSON, the total number of hits for the query.
