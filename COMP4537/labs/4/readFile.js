const http = require('http');
const url = require('url');
const fs = require('fs');

http.createServer(function (req, res) {
	const query = url.parse(req.url, true);
	const filename = "." + query.pathname;
	fs.readFile(filename, function(err, data) {
		if (err) {
			res.writeHead(404, {
				"Content-Type": "text/html"
			});
			return res.end(query.pathname + " 404 Not Found!");
		}
		res.writeHead(200, {"Content-Type": "text/html"});
		res.write(data);
		return res.end();
	});
}).listen(8080);
