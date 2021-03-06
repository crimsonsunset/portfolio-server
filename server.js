const express = require('express');
const cheerio = require('cheerio');
const request = require('request');
const cors = require('cors');
const joeInfo = require('./joeInfo.json');
const app = express();
const router = express.Router();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const fs = require('fs');
const path = require('path');
// const materialCSS = require('swagger-ui-themes/themes/2.x/theme-material.css');
// console.log(materialCSS);

var showExplorer = false;
var options = {};
var customCss = '#header { display: cool }';

fs.readFile("public/theme-material.css", "utf8", function(err, data) {
	let cssFile = data;
	let setup = swaggerUi.setup(swaggerDocument, showExplorer, options);
	let serve = swaggerUi.serve;

	app.use('/api/v1/', serve, setup);
	app.use('/api/v1/api-docs', serve, setup);
	app.use('/api-docs', serve, setup);
	app.use('/', serve, setup);
});

app.set('port', (process.env.PORT || 3000));
app.use(cors());

app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

//prefix the api routes
app.use('/api/v1', router);

// app.get('/', function (req, res) {
// 	res.send('Welcome to Joe Sangiorgio Porfolio API!')
// });


router.get('/info/:item', function (req, res) {
	const {item} = req.params;
	res.json(joeInfo[item])
});

router.get('/scrape/:slug', function (req, res) {
	const {slug} = req.params;
	const wikiLink = `https://en.wikipedia.org/wiki/${slug}`;
	const jokeLink = `http://lmgtfy.com/?q=${slug}`;
	request(`https://en.wikipedia.org/wiki/${slug}`, (error, response, html) => {
		if (!error && response.statusCode == 200) {
			const $ = cheerio.load(html);
			let definitionTxt = $('.mw-parser-output p').first().text();
			if (slug == 'JavaScript') {
				definitionTxt = $($('.mw-parser-output p')[2]).text()
			}
			let imgSrc = $('.infobox.vevent tr').first().find('img').attr('src');
			imgSrc = (imgSrc) ? imgSrc.replace('//', 'https://') : '';
			let websiteUrl = $('.infobox.vevent tr').find('.url a').attr('href');
			res.json({
				name: slug.replace('_', ' '),
				websiteUrl,
				definitionTxt,
				imgSrc,
				wikiLink,
				jokeLink,
			});
		}
	});
});

app.listen(app.get('port'), function () {
	console.log('Example app listening on port 3000!')
});

