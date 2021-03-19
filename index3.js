const express = require('express');
const fs = require('fs');
const app = express();
const path = require('path');
const url = require('url');
const dbs = require('./COMP4537/labs/6/public/js/sendToServer');

const port = process.env.PORT || 8080;

const connection = dbs.createConnection();
// allows all origins and methods for requests
app.all('/COMP4537/labs/6/admin.html', function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
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
        body = JSON.parse(body);
        dbs.connectToDB(connection, body, body.command, res);
    });
    app.use(express.static(__dirname + '/COMP4537/labs/6/public'));
});


app.post('/COMP4537/labs/6/admin.html', function(req, res) {
    let body = '';
    req.on('data', data => {
        body += data;
        body = JSON.parse(body);
        console.log(body);
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

