const request = require("request");
const hn = require("hacker-news-api");
const striptags = require('striptags');
const Entities = require('html-entities').XmlEntities;
entities = new Entities();

request("http://hn.algolia.com/api/v1/items/12016568", (error, response, body) => {
	let comments = JSON.parse(body).children;
	let lookingFor = comments
		.filter((x) => x.text)
		.map((commentObj) => entities.decode(striptags(commentObj.text.toLowerCase())))
		.filter(comment => comment.indexOf("python") >= 0 && comment.indexOf("remote") >= 0);
	lookingFor.forEach(x => {
		console.log(x);
		console.log("\n\n\n");
	})
})
