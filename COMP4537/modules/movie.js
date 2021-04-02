const express = require('express');
const dbs = require('./connect');
const Request = require('tedious').Request;

const app = express();
const endPoint = "/API/v1/"

connection = dbs.createConnection();

function getMovies(connection, response) {
    const Q_MOVIES = `SELECT * FROM movies`;
    let movie_info = [];
    let requestSelect = new Request(Q_MOVIES, function(err, result) {
        if(err) throw err;
    })
    requestSelect.on('row', (columns) => {
        let movie = {
            'movieId': columns[0].value,
            'title': columns[1].value,
            'year': columns[2].value,
            'genre': columns[3].value
        }
        movie_info.push(movie);
    })

    requestSelect.on('requestCompleted', function() {
        response.send(JSON.stringify(movie_info));
    });

    connection.execSql(requestSelect);
}

function addMovie(connection, response, movieInfo) {
    const INSERTMOVIE = `IF NOT EXISTS (SELECT * FROM movies WHERE title = '${movieInfo.title}')
    INSERT INTO movies (title, year, genre, reviewId) VALUES ('${movieInfo.title}', ${movieInfo.year}, '${movieInfo.genre}', ${movieInfo.reviewId});`;
    let requestInsert = new Request(INSERTMOVIE, function(err) {
        if(err) throw err;
    });

    requestInsert.on('requestCompleted', function() {
        
    });

    connection.execSql(requestInsert);
    console.log("Insertion completed!");
}

function getMovieById(connection, response, id) {
    const Q_MOVIES = `SELECT * FROM movies WHERE movieId = ${id}`;
    let movie_info = {};
    let requestSelect = new Request(Q_MOVIES, function(err, result) {
        if(err) throw err;
    })
    requestSelect.on('row', (columns) => {
        movie_info['movieId'] = columns[0].value,
        movie_info['title'] = columns[1].value,
        movie_info['year'] = columns[2].value,
        movie_info['genre'] = columns[3].value
    })

    requestSelect.on('requestCompleted', function() {
        response.send(JSON.stringify(movie_info));
    });

    connection.execSql(requestSelect);
}

app.get(endPoint + "movie",  function(req, res) {
    console.log('Getting movies');
    getMovies(connection, res);
});

app.post(endPoint + "movie",  function(req, res) {
    console.log('Adding a movie');
    let body = '';
    req.on('data', data => {
        body += data;
        body = JSON.parse(body);
        console.log(body);
        
    });

    req.on('end', () => {
        addMovie(connection, res, body);
    });
});

app.get(endPoint + "movie/:id",  function(req, res) {
    console.log('Getting specified movie');
    getMovieById(connection, res, req.params.id);
});

module.exports = app;