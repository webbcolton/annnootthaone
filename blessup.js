var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var config = require('./config');
var app = express();

var querystring = require('querystring');
var http = require('http');

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.post('/blessup', function (req,res){

	 if (req.body.token == config.slack_token) {
	 	var search_str = req.body.text; //User typed input
	 	var channel_name = req.body.channel_name;
	 	write_to_slack(search_str, channel_name)
	 } else {
	 	console.log('Congratulations, you played yourself. This request is not coming from Slack!');
	 }
})

function write_to_slack(search, channelname) {

	url = 'http://www.bing.com/images/search?q=dj%20khaled%20' + search + '&qs=n&form=QBIR&pq=dj%20khaled%20' + search + '&sc=8-9&sp=-1&sk=';
	console.log(url);
	channelname = '#' + channelname;

	request (url, function(error, response, html){

		//Defining the variables we need
		var channel, username, text;
		var payload = {channel: channelname, username: config.name, text: ""};
 
		if(!error){		//Checking if errors occur first when making the request

			var $ = cheerio.load(html);
			var text = '<' + ($('#main .content .row .item div img').attr('src')) + '|' + search + '>';
			payload.text = text; //Storing imageurl into json object

		} else {
			console.log('Error attempting to scrape');
		}

		  // Sending POST request
 			request.post(config.slack_webhook_url, { json: payload }, function (error, response, body) {

        	if (!error && response.statusCode == 200) {
            	console.log(body);
       		} else {
       			console.log('POST error');
       		}

    	});
	});
}

app.listen(config.port)
console.log('Bless up on port ' + config.port);
exports = module.exports = app;
