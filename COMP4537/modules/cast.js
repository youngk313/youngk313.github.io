const app = require('./review');
const classes = require('./classes');
const Request = require('tedious').Request;
const dbs = require('./connect');
const { RequestError } = require('tedious');

connection = dbs.createConnection();

const endPoint = "/API/v1/"

let request_count = {
    "cast": {
        'GET': 0,
        'POST': 0,
    }
}

function addCast(connection, response, castInfo) {
    const INSERTCAST = `IF NOT EXISTS (SELECT * FROM cast WHERE movieId = ${castInfo.movieId} AND actorId =${castInfo.actorId})
    INSERT INTO cast (movieId, actorId, act_role) VALUES (${castInfo.movieId}, ${castInfo.actorId}, '${castInfo.role}');`;
    let err_flag;
    let requestInsert = new Request(INSERTCAST, function(err) {
        if(err)  {
            err_flag = true 
            if (err.message.includes("actor_pk")) {
                response.status(418);
                response.send("ERROR: Actor doesn't exist in the database. Add the actor first.")
            }
            else if (err.message.includes("movie_pk")) {
                response.status(418)
                response.send("ERROR: Movie doesn't exist in the database. Add the movie first.")
            }
            console.log("Insert failed")
        }
    });

    requestInsert.on('requestCompleted', function() { 
        if (!err_flag) {
            request_count['cast'].POST++;
            response.status(200);
            response.send("Added movie successfully");
            console.log("Insertion completed!");
        }
    });

    connection.execSql(requestInsert);
} 

function getCast(connection, response, movieId) {
    const Q_CAST = `SELECT movies.movieId, title, year, genre, actors.actorId, fullname, age, pictureURL, act_role FROM ((cast INNER JOIN movies ON movies.movieId = ${movieId}) INNER JOIN actors ON actors.actorId = cast.actorId)`;
    let cast_info = {'actors': [], 'roles':[]};
    let requestSelect = new Request(Q_CAST, function(err, result) {
        if(err) throw err;
    })
    requestSelect.on('row', (columns) => {
        cast_info['movie'] = new classes.Movie(columns.slice(0, 4))
        cast_info['actors'].push(new classes.Actor(columns.slice(4, 8)));
        cast_info['roles'].push(columns[8].value);
    });

    requestSelect.on('requestCompleted', function() {
        if (cast_info.actors.length > 0) {
            response.status(200);
            request_count["cast"].GET++;
            response.send(JSON.stringify(cast_info));
        }
        else {
            response.status(404);
            response.send("No such cast in database");
        }
    });

    connection.execSql(requestSelect);
} 

app.get(endPoint + "cast/:id", function(req, res) {
    console.log('Getting cast of the movie: ' + req.params.id);
    try{
        getCast(connection, res, req.params.id);
    } catch(e) {
        if (e instanceof RequestError) {
            res.status(500)
            res.send("Error: server can't handle that many requests ")
        }
    }
    
});

app.post(endPoint + "cast",  function(req, res) {
    console.log('Adding the cast...');
    let body = '';
    req.on('data', data => {
        body += data;
        body = JSON.parse(body);
        console.log(body);
        addCast(connection, res, body);
    });
});

module.exports = app;

