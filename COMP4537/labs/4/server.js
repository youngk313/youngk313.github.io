const http = require('http');
const url = require('url');
const port = process.env.PORT || 8080

http.createServer(function (req, res) {
	const query = url.parse(req.url, true);
	res.writeHead(200, {"Content-Type": "text/html"});
	res.end('Hello ' + query.query["text"]);
}).listen(port);