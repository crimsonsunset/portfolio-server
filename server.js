const express = require('express');
const cheerio = require('cheerio');
const request = require('request');
const cors = require('cors');
const joeInfo = require('./joeInfo.json');
const app = express();
// const mailjet = require('node-mailjet')
// 	.connect('a62b98ba9d1b79455f9f92ef61b8eed2', 'ea86a27e20e56f8a9cf4f79a8c08f6e0')

app.use(cors());

app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.get('/', function (req, res) {
	res.send('Hello World!')
});
app.get('/api/:item', function (req, res) {
	const {item} = req.params;
	res.json(joeInfo[item])
})

app.get('/scrape', function (req, res) {

	const {endPath} = req.query;
	const wikiLink = `https://en.wikipedia.org/wiki/${endPath}`;
	const jokeLink = `http://lmgtfy.com/?q=${endPath}`;
	request(`https://en.wikipedia.org/wiki/${endPath}`, (error, response, html) => {
		if (!error && response.statusCode == 200) {
			const $ = cheerio.load(html);
			let definitionTxt = $('.mw-parser-output p').first().text();
			if (endPath == 'JavaScript') {
				definitionTxt = $($('.mw-parser-output p')[2]).text()
			}
			let imgSrc = $('.infobox.vevent tr').first().find('img').attr('src');
			imgSrc = (imgSrc) ? imgSrc.replace('//', 'https://') : '';
			let websiteUrl = $('.infobox.vevent tr').find('.url a').attr('href');
			res.json({
				name: endPath.replace('_', ' '),
				websiteUrl,
				definitionTxt,
				imgSrc,
				wikiLink,
				jokeLink,
			});
		}
	});
});

app.listen(3000, function () {
	console.log('Example app listening on port 3000!')
});


/**
 * This call sends an email to one recipient, using a validated sender address
 * Do not forget to update the sender address used in the sample
 */


// function sendMail() {
// 	console.log('about to sendzz', mailjet)
// 	let request = mailjet
// 		.post("send")
// 		.request({
// 			"FromEmail": "jsangio1@gmail.com",
// 			"FromName": "Mailjet Pilot",
// 			"Subject": "Your email flight plan!",
// 			"Text-part": "Dear passenger, welcome to Mailjet! May the delivery force be with you!",
// 			"Html-part": "<h3>Dear passenger, welcome to Mailjet!</h3><br />May the delivery force be with you!",
// 			"Recipients": [
// 				{
// 					"Email": "passenger@mailjet.com"
// 				}
// 			]
// 		});
//
//
// 	// request
// 	// 	.on('success', function (response, body) {
// 	// 		console.log(response.statusCode, body);
// 	// 	})
// 	// 	.on('error', function (err, response) {
// 	// 		console.log(response.statusCode, err);
// 	// 	});
// }
//
//
// sendMail();

