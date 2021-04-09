const express = require('express');
const dbs = require('./COMP4537/labs/6/public/js/sendToServer');
const app = require('./COMP4537/modules/cast');
const { auth } = require('express-openid-connect');
const bcrypt = require('bcrypt');
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;
const req = require("request");

const port = process.env.PORT || 8080;

const endPoint = "/API/v1/";

const db = require('./COMP4537/modules/connect');

var connection = dbs.createConnection();

app.use(express.urlencoded({extended:false}));

// allows all origins and methods for requests

app.get('/', function(req, res) {
    res.sendFile(__dirname + "/index.html");
    app.use(express.static(__dirname + '/public'));
});

app.get('/index.html', function(req, res) {
    res.sendFile(__dirname + "/index.html");
    app.use(express.static(__dirname + '/public'));
});

app.get('/COMP4537/labs/lab1/quizQuestions/index.html', function(req, res) {
    res.sendFile(__dirname + "/COMP4537/labs/lab1/quizQuestions/index.html");
    app.use(express.static(__dirname + '/COMP4537/labs/lab1/quizQuestions/public'));
});

app.get('/COMP4537/labs/5/writeDB.html', function(req, res) {
    res.sendFile(__dirname + "/COMP4537/labs/5/writeDB.html");
    app.use(express.static(__dirname + '/COMP4537/labs/5/public'));
});

app.get('/COMP4537/labs/6/index.html', function(req, res) {
    res.sendFile(__dirname + '/COMP4537/labs/6/index.html');
    app.use(express.static(__dirname + '/COMP4537/labs/6/public'));
});

app.get('/COMP4537/labs/6/', function(req, res) {
    dbs.connectToDB(connection, "", "get", res);
});

app.get('/COMP4537/labs/6/admin.html', function(req, res) {
    res.sendFile(__dirname + '/COMP4537/labs/6/admin.html');
    app.use(express.static(__dirname + '/COMP4537/labs/6/public'));
});

app.get('/COMP4537/labs/6/student.html', function(req, res) {
    res.sendFile(__dirname + '/COMP4537/labs/6/student.html');
    app.use(express.static(__dirname + '/COMP4537/labs/6/public'));
});

app.put('/COMP4537/labs/6/admin.html', function(req, res) {
    let body = '';
    req.on('data', data => {
        body += data;
    });

    req.end('end', function() {
        body = JSON.parse(body);
        console.log(body)
        dbs.connectToDB(connection, body, body.command, res);
    })
});

app.get('/API/v1/documentation.html', function(req, res) {
    res.sendFile(__dirname + '/COMP4537/index.html');
});

app.post('/COMP4537/labs/6/admin.html', function(req, res) {
    let body = '';
    req.on('data', data => {
        body += data;
        body = JSON.parse(body);
        dbs.connectToDB(connection, body, body.command, res);
    });

    console.log("post happened");
});

app.get('/COMP4537/comp4537.html', function(req, res) {
    res.sendFile(__dirname + '/COMP4537/comp4537.html');
    app.use(express.static(__dirname + '/public'));
});

function handleLogin(connection, response, parameters) {
    const LOGIN_Q = `SELECT * FROM users WHERE userName = @username`;
    let storedPW;
    const request = new Request(LOGIN_Q, (err) => {
        if (err) {
            res.status(400);
            res.send('Request could not be made.');
        }
    });

    request.on('row', function(columns) {
        if (columns.length == 0) {
            response.status(406);
            response.send('User not found');
        } else {
            console.log(columns[1].value)
            storedPW = columns[2].value;
            console.log(storedPW)
        }
    });

    request.on('requestCompleted', async () => {
        bcrypt.compare(parameters.password, storedPW, function(err, res) {
            if (res) {
                var options = { 
                    method: 'POST',
                    url: 'https://dev-aj5gwo7g.us.auth0.com/oauth/token',
                    headers: { 'content-type': 'application/json' },
                    body: '{"client_id":"6MAEMk5gPi8Zb2U5IoCbCyfSdQNk9rCf","client_secret":"jvezwddJ7_a79eEfJU8ik99De0GyNxeEth_mW54sYAXUsth1O1pDBUqbG8w-OZFx","audience":"https://dev-aj5gwo7g.us.auth0.com/api/v2/","grant_type":"client_credentials"}' 
                };
        
                req(options, function (error, resp, body) {
                    if (error) throw new Error(error);
                    response.status(200);
                    response.send(body);
                });
            } else {
                response.status(406);
                response.send("Wrong password has been given.")
            }
        });
    });

    request.addParameter('username', TYPES.NVarChar, parameters.username);
    connection.execSql(request);
}

async function handleRegistration(connection, response, parameters) {
    const INSERTUSER = `IF NOT EXISTS (SELECT * FROM users WHERE userName = @username)
    INSERT INTO users (userName, pw) VALUES (@username, @password);`;
    const salt = 10;
    const hashed = await bcrypt.hash(parameters.password, salt);
    let flag = false;
    const request = new Request(INSERTUSER, (err) => {
        if (err) {
            flag = true;
            response.status(400);
            response.send('Request could not be made.');
        }
    });

    request.on('requestCompleted', async () => {
        if (!flag) {
            response.status(200)
            response.send("User succesfully added");
        }
    });
    request.addParameter('username', TYPES.NVarChar, parameters.username);
    request.addParameter('password', TYPES.NVarChar, hashed);
    connection.execSql(request);
}

// handles registration
app.post(endPoint + 'register', async (req, res) => {
    let body = '';
    req.on('data', async (data) => {
        body += data;
        body = JSON.parse(body);
        console.log(body);
        handleRegistration(connection, res, body)
    });
});

// handles login post request
app.post(endPoint + 'login', async (req, res) => {
    console.log(req.body)
    let body = '';
    req.on('data', async (data) => {
        body += data;
        body = JSON.parse(body);
        console.log(body);
        handleLogin(connection, res, body)
    });
});

app.use(function(err, req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'GET, PUT, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Methods', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    if (err.name === "UnauthorizedError") {
        res.status(401)
        res.send("You are unauthorized to access this data")
    }
    next();
});

app.listen(port, () => {
    
});

