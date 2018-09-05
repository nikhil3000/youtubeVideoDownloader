const express = require('express');
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser');
const app = express();
var path = require('path');
var fs   = require('fs');
var ytdl = require('youtube-dl');
var request = require('request');
location = {}; 
const streamsaver = require('streamsaver')

// const save = require('save-file')

//handlebars middlewares
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get('/',(req,res)=>{
	res.render('index');
})
app.get('/playlist',(req,res)=>{
	res.render('playlist');
})
app.post('/playlist',(req,res)=>{
	var list = [] ;
	var str = req.body.url;
	var url = 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet%2CcontentDetails&maxResults=50&fields=items%2FcontentDetails%2FvideoId%2CnextPageToken&key=AIzaSyDiTRk48jlGum6eMNZWCiAG3kWTQivg1vg'
	for(var i=0;i<str.length;i++)
	{
		if(str.charAt(i) == '=')
		{
			// console.log(str.substring(i-4,i));
			if(str.substring(i-4,i) == 'list')
			{
				var pos = ++i;
				while(str.charAt(i++)!="=" && i<str.length);
				var id = str.substring(pos,i);
				// console.log(id);
				url += '&playlistId=' + id;
				break;
			}
		}
	}
	if(req.body.nextPageToken)
	{
		url += '&pageToken=' + req.body.nextPageToken;
	}
	request(url,{json:true},(err,res1,body)=>{
		if(err)
		{
			res.send('fail');
		}
		for(var i=0;i<body.items.length;i++)
		{
			// console.log(body.items[i].contentDetails.videoId);
			list.push(body.items[i].contentDetails.videoId);
		}
		// console.log('page 1');
		// console.log(body.items);
		var baseURL = 'http://www.youtube.com/watch?v=';
		for(var i=0;i<list.length;i++)
		{
			// console.log(i);
			// console.log(baseURL + list[i]);
			playlist(baseURL + list[i]);
		}
		if(body.nextPageToken)
		{
			res.send('Please use this nextPageToken to download rest of videos of this playlist' +body.nextPageToken);
		}
		else
		{
			res.send('Downloading. Please wait!');
		}
	})
})

app.get('/video',(req,res)=>{
	res.render('video');
})

app.post('/video',(req,res)=>{
	playlist(req.body.url);
	res.send('Downloading. Please wait!');

})

var port = process.env.PORT || 5000;

app.listen(port,(err=>{
	if(err)
		consle.log(err);
	else
		console.log('server started at port 5000');
}))


function playlist(url) {

	console.log('hello');
	'use strict';
	var video = ytdl(url);
  // console.log(video);

  video.on('error', function error(err) {
  	console.log('error 2:', err);
  });

  var size = 0;
  var output;
  var title;
  video.on('info', function(info) {
    // console.log(info);
    ginfo = info;
    size = info.size;
    var dir = __dirname + '/ytd';
    console.log(dir);
    if (!fs.existsSync(dir))
    	fs.mkdirSync(dir);
    var title = info.title;
    output = path.join(dir, info.title + '.mp4');
    video.pipe(fs.createWriteStream(output));
});

  var pos = 0;
  video.on('data', function data(chunk) {
  	pos += chunk.length;
    // // `size` should not be 0 here.
    // if (size) {
    	if (size) {
      var percent = (pos / size * 100).toFixed(2);
      process.stdout.cursorTo(0);
      process.stdout.clearLine(1);
      process.stdout.write(percent + '%');
    }
    });

}


