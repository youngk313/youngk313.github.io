const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const port = process.env.PORT || 8080

http.createServer(function (req, res) {
    let filePath = '.' + req.url;
    let loadStatic = true;
    if (filePath == './') {
        filePath = './index.html';
    } else if (filePath == './COMP4537/labs/4/writeFile') {
        const query = url.parse(req.url, true);
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end('Hello ' + query.query["text"]);
        loadStatic = false;
    } else if (filePath == './COMP4537/labs/4/readFile') {
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
    }
    if (loadStatic) {
        const extname = String(path.extname(filePath)).toLowerCase();
        const mimeTypes = {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.wav': 'audio/wav',
            '.mp4': 'video/mp4',
            '.woff': 'application/font-woff',
            '.ttf': 'application/font-ttf',
            '.eot': 'application/vnd.ms-fontobject',
            '.otf': 'application/font-otf',
            '.wasm': 'application/wasm'
        };

        let contentType = mimeTypes[extname] || 'application/octet-stream';

        fs.readFile(filePath, function(error, content) {
            if (error) {
                if(error.code == 'ENOENT') {
                    fs.readFile('./404.html', function(error, content) {
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        res.end(content, 'utf-8');
                    });
                }
                else {
                    res.writeHead(500);
                    res.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
                }
            }
            else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
    }
  
}).listen(port);