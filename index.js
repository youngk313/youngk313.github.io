const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const port = process.env.PORT || 8080;
const readFileURL = './COMP4537/labs/4/readFile';
const contentType = { "Content-Type": "text/html"};

http.createServer(function (req, res) {
    let filePath = '.' + req.url;
    let loadStatic = true;
    if (filePath == './') {
        filePath = './index.html';
    } else if (filePath.includes('./COMP4537/labs/4/writeFile')) {
        // writes query to file.txt
        const query = url.parse(req.url, true);
        const newText = "\nURL: " + req.headers.host + req.url + "\ntext: " + query.query["text"] + "\n"
        console.log(newText)
        fs.appendFile(readFileURL + "/file.txt", newText, function(err, data) {
            if (err) {
                res.writeHead(404, contentType);
                return res.end(filename + " 404 Not Found!");
            }
            res.writeHead(200, contentType);
            return res.end("Saved! Output: " + newText, 'utf-8');;
        });
        loadStatic = false;
    } else if (filePath.includes(readFileURL)) {
        // reads file from ./file.txt and shows on webpage
        const query = url.parse(req.url, true);
        const filename = "." + query.pathname;
        fs.readFile(filename, 'utf8', function(err, data) {
            console.log(data)
            if (err) {
                res.writeHead(404, contentType);
                return res.end(filename + " 404 Not Found!");
            }
            res.writeHead(200, contentType);
            return res.end(data, 'utf-8');
        });
        loadStatic = false;
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

        fs.readFile(filePath, function(err, content) {
            if (err) {
                if(err.code == 'ENOENT') {
                    fs.readFile('./404.html', function(err, content) {
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        res.end(content, 'utf-8');
                    });
                }
                else {
                    res.writeHead(500);
                    res.end('Sorry, check with the site admin for error: '+ err.code+' ..\n');
                }
            }
            else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
    }
  
}).listen(port);