const express = require('express');
const fs = require('fs');
const path = require('path');
const url = require('url');
const dbs = require('./COMP4537/labs/6/public/js/sendToServer');
const app = require('./COMP4537/modules/movie');

const port = process.env.PORT || 8080;

const connection = dbs.createConnection();
// allows all origins and methods for requests
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.header('Access-Control-Allow-Methods', '*');
    next();
});

app.use(express.json());

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
    let body ='';
    (req.on('data', data => {

    }))
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

app.listen(port, () => {
    
});

