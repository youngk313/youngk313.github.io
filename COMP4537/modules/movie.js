const express = require('express');
const dbs = require('./connect');
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;
const classes = require('./classes');

const app = express();
const endPoint = "/API/v1/"

const checkJwt = require('./checkJWT')

connection = dbs.createConnection();

let requestCount = {
    "movie": {
        'GET': 0,
        'POST': 0,
    },
    "movie/id": {
        'GET': 0,
        'PUT': 0,
        'DELETE': 0
    },
    "movie/genre": {
        'GET': 0
    }
};

function getMovies(connection, response) {
    const Q_MOVIES = `SELECT * FROM movies`;
    let movie_info = [];
    let requestSelect = new Request(Q_MOVIES, function(err, result) {
        if(err) throw err;
    })
    requestSelect.on('row', (columns) => {
        let movie = new classes.Movie(columns);
        movie_info.push(movie);
    });

    requestSelect.on('requestCompleted', function() {
        if (movie_info.length > 0) {
            response.status(200);
            requestCount.movie.GET++;
            response.send(JSON.stringify(movie_info));
        }
        else {
            response.status(404);
            response.send("No movies in database");
        }
    });

    connection.execSql(requestSelect);
}

function addMovie(connection, response, movieInfo) {
    const INSERTMOVIE = `IF NOT EXISTS (SELECT * FROM movies WHERE title = '${movieInfo.title}')
    INSERT INTO movies (title, year, genre) VALUES ('${movieInfo.title}', ${movieInfo.year}, '${movieInfo.genre}');`;
    let requestInsert = new Request(INSERTMOVIE, function(err) {
        if(err) throw err;
    });

    requestInsert.on('requestCompleted', function() {   
        requestCount.movie.POST++;
        response.status(200);
        response.send("Added movie successfully");
    });

    connection.execSql(requestInsert);
    console.log("Insertion completed!");
}

function getMovieById(connection, response, id) {
    const Q_MOVIES = `SELECT * FROM movies WHERE movieId = ${id}`;
    let movie_info;
    let requestSelect = new Request(Q_MOVIES, function(err, result) {
        if(err) throw err;  
    })
    requestSelect.on('row', (columns) => {
        movie_info = new classes.Movie(columns);
    })

    requestSelect.on('requestCompleted', function() {
        if (movie_info == undefined) {
            response.status(404);
            response.send("Movie does not exist in database");
        } else {
            response.status(200);
            requestCount["movie/id"].GET++;
            response.send(JSON.stringify(movie_info));
        }
    });

    connection.execSql(requestSelect);
}

function getMoviesByGenre(connection, response, genre) {
    const Q_MOVIES = `SELECT * FROM movies WHERE genre = @genre`;
    let movie_info = [];
    let requestSelect = new Request(Q_MOVIES, function(err, result) {
        if(err) throw err;
    })
    requestSelect.on('row', (columns) => {
        let movie = new classes.Movie(columns);
        movie_info.push(movie);
    });

    requestSelect.on('error', function() {
        console.log('error')
    })

    requestSelect.on('requestCompleted', function() {
        response.status(200);
        requestCount["movie/genre"].GET++;
        response.send(JSON.stringify(movie_info));
    });

    requestSelect.addParameter('genre', TYPES.VarChar, genre);

    connection.execSql(requestSelect);
}

function updateMovie(connection, response, movieInfo) {
    const UPDATEMOVIE = `UPDATE movies SET title = @title, year = @year, genre = @genre WHERE movieId = @id`;
    let movie_info;
    let requestUpdate = new Request(UPDATEMOVIE, function(err, result) {
        if(err) throw err;
    })
    
    requestUpdate.on('row', (columns) => {
        movie_info = new classes.Movie(columns);
    })

    requestUpdate.on('requestCompleted', function() {
        response.status(200);
        requestCount["movie/id"].PUT++;
        response.send("Successfully updated movie entry");
    });

    requestUpdate.addParameter('id', TYPES.Int, movieInfo.id);
    requestUpdate.addParameter('title', TYPES.VarChar, movieInfo.title);
    requestUpdate.addParameter('year', TYPES.Int, movieInfo.year);
    requestUpdate.addParameter('genre', TYPES.VarChar, movieInfo.genre);

    connection.execSql(requestUpdate);
}

function deleteMovieById(connection, response, id) {
    let DELETEMOVIE = `DELETE FROM movies WHERE movieId = @id`;
    let requestDelete = new Request(DELETEMOVIE, function(err) {
        if(err) throw err;
    });

    requestDelete.on('requestCompleted', function() {
        response.status(200);
        requestCount["movie/id"].DELETE++;
        response.send("Successfully deleted movie entry");
    });

    requestDelete.addParameter('id', TYPES.Int, id);
    connection.execSql(requestDelete);
    console.log("Deletion completed!");
}

app.get(endPoint + "movie", function(req, res) {
    console.log('Getting movies');
    req.on('data', async (data) => {
        body += data;
        body = JSON.parse(body);
        console.log(body);
    });
    getMovies(connection, res);
});

app.post(endPoint + "movie", checkJwt, function(req, res) {
    console.log('Adding a movie');
    let body = '';
    req.on('data', data => {
        body += data;
        body = JSON.parse(body);
        console.log(body);
        addMovie(connection, res, body);
    });
});

app.put(endPoint + "movie/:id", checkJwt, function(req, res) {
    console.log('Updating specified movie with id: ' + req.params.id);
    let body = '';
    req.on('data', data => {
        body += data;
        body = JSON.parse(body);
        console.log(body);
    });

    req.on('end', () => {
        updateMovie(connection, res, body);
    });
});

app.get(endPoint + "movie/requests", checkJwt, function(req, res) {
    console.log("Returning number of requests");
    res.send(JSON.stringify(requestCount));
});

app.get(endPoint + "movie/genres/:genre", function(req, res) {
    console.log('Getting specified movie with genre: ' + req.params.genre);
    getMoviesByGenre(connection, res, req.params.genre);
});

app.get(endPoint + "movie/:id", function(req, res) {
    console.log('Getting specified movie with id: ' + req.params.id);
    try {
        getMovieById(connection, res, req.params.id);
    }
    catch(e) {
        if (e instanceof ReferenceError) {
            res.status(500);
            res.send("Could not connect to database");
        } else if (e instanceof RequestError) {
            res.status(400);
            res.send("Disconnected from database");
        }
    }
});

app.delete(endPoint + "movie/:id", checkJwt, function(req, res) {
    console.log('Deleting specified movie with id: ' + req.params.id);
    deleteMovieById(connection, res, req.params.id);
});

module.exports = app;