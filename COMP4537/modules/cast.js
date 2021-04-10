const app = require('./review');
const classes = require('./classes');
const Request = require('tedious').Request;
const dbs = require('./connect');
const resource = require('./resource');
const checkJwt = require('./checkJWT');

connection = dbs.createConnection();

const endPoint = "/API/v1/"

function addCast(connection, response, castInfo) {
    const INSERTCAST = `IF NOT EXISTS (SELECT * FROM cast WHERE movieId = @movieId AND actorId = @actorId)
    INSERT INTO cast (movieId, actorId, act_role) VALUES (@movieId, @actorId, @role);`;
    let err_flag;
    let requestInsert = new Request(INSERTCAST, function(err) {
        if(err)  {
            err_flag = true 
            response.status(418);
            if (err.message.includes("actor_pk")) {
                response.send("ERROR: Actor doesn't exist in the database. Add the actor first.")
            }
            else if (err.message.includes("movie_pk")) {
                response.send("ERROR: Movie doesn't exist in the database. Add the movie first.")
            }
            console.log("Insert failed")
        }
    });

    requestInsert.on('requestCompleted', function() { 
        if (!err_flag) {
            console.log("Insertion completed!");
            let message = "Added cast successfully";
            resource.updateRequest(connection, response, message, resource.requests["post_cast"])
        }
    });

    requestInsert.addParameter('movieId', TYPES.Int, castInfo.movieId);
    requestInsert.addParameter('actorId', TYPES.Int, castInfo.actorId);
    requestInsert.addParameter('role', TYPES.VarChar, castInfo.role);
    connection.execSql(requestInsert);
} 

function getCast(connection, response, movieId) {
    const Q_CAST = `SELECT movies.movieId, title, movies.year, genre, actors.actorId, fullname, actors.year, pictureURL, act_role FROM ((cast INNER JOIN movies ON movies.movieId = ${movieId}) INNER JOIN actors ON actors.actorId = cast.actorId)`;
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
            console.log("Retrieved cast successfully!")
            resource.updateRequest(connection, response, JSON.stringify(cast_info), resource.requests["post_cast"])
        }
        else {
            response.status(404);
            response.send("No such cast in database");
        }
    });

    connection.execSql(requestSelect);
} 

app.get(endPoint + "cast/:id", checkJwt, function(req, res) {
    console.log('Getting cast of the movie: ' + req.params.id);
    try{
        getCast(connection, res, req.params.id);
    } catch(e) {
        res.status(500);
        res.send("Error: server can't handle that many requests ");
    }
});

app.post(endPoint + "cast", checkJwt, function(req, res) {
    console.log('Adding the cast...');
    let body = '';
    req.on('data', data => {
        body += data;
        body = JSON.parse(body);
        console.log(body);
        try {
            addCast(connection, res, body);
        } catch(e) {
            res.status(400);
            res.send("Error: cannot add the cast to the database"); 
        }
    });
});

module.exports = app;

