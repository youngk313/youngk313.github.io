const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;
const dbs = require('./connect');
const app = require('./movie');
const classes = require('./classes');
const endPoint = "/API/v1/";
const resource = require('./resource');
const checkJwt = require('./checkJWT');

connection = dbs.createConnection();

function getActors(connection, response) {
    const Q_ACTORS = `SELECT * FROM actors`;
    let actor_info = [];
    let requestSelect = new Request(Q_ACTORS, function(err, result) {
        if(err) throw err;
    })
    requestSelect.on('row', (columns) => {
        let actor = new classes.Actor(columns);
        actor_info.push(actor);
    })

    requestSelect.on('requestCompleted', function() {
        if (actor_info.length > 0) {
            console.log("Retrieved actors successfully");
            resource.updateRequest(connection, response, JSON.stringify(actor_info), resource.requests["get_actor"]);
        }
        else {
            response.status(404);
            response.send("No actors in database");
        }
    });

    connection.execSql(requestSelect);
}

function addActor(connection, response, actorInfo) {
    const INSERTACTOR = `IF NOT EXISTS (SELECT * FROM actors WHERE fullname = @fullname)
    INSERT INTO actors (fullname, year, pictureURL) VALUES (@fullname, @year, @URL);`;
    let requestInsert = new Request(INSERTACTOR, function(err) {
        if(err) throw err;
    });

    requestInsert.on('requestCompleted', function() {
        let message = "Actor added successfully";
        resource.updateRequest(connection, response, message, resource.requests["post_actor"]);
    });

    requestInsert.addParameter('fullname', TYPES.VarChar, actorInfo.fullname);
    requestInsert.addParameter('year', TYPES.Int, actorInfo.year);
    requestInsert.addParameter('URL', TYPES.VarChar, actorInfo.pictureURL);
    
    connection.execSql(requestInsert);
    console.log("Insertion completed!");
}

function getActorById(connection, response, id) {
    const GETACTOR = `SELECT * FROM actors WHERE actorId = @id`;
    let actor_info;
    let requestSelect = new Request(GETACTOR, function(err, result) {
        if(err) throw err;
    })
    requestSelect.on('row', (columns) => {
        actor_info = new classes.Actor(columns);
    })

    requestSelect.on('requestCompleted', function() {
        if (actor_info != undefined) {
            console.log("Retrieved actor!")
            resource.updateRequest(connection, response, JSON.stringify(actor_info), resource.requests["get_actorId"]);
        }
        else {
            response.status(404);
            response.send("No such cast in database");
        }
    });

    requestSelect.addParameter('id', TYPES.Int, id);
    connection.execSql(requestSelect);
}

function updateActor(connection, response, actorInfo) {
    const UPDATEACTOR = `UPDATE actors SET fullname = @fullname, year = @year, pictureURL = @pictureURL WHERE actorId = @id`;
    let actor_info;
    let requestUpdate = new Request(UPDATEACTOR, function(err, result) {
        if(err) throw err;
    })
    
    requestUpdate.on('row', (columns) => {
        actor_info = new classes.Actor(columns);
    })

    requestUpdate.on('requestCompleted', function() {
        let message = "Successfully updated actor entry";
        resource.updateRequest(connection, response, message, resource.requests["put_actorId"]);
    });

    requestUpdate.addParameter('id', TYPES.Int, actorInfo.id);
    requestUpdate.addParameter('fullname', TYPES.VarChar, actorInfo.fullname);
    requestUpdate.addParameter('year', TYPES.Int, actorInfo.year);
    requestUpdate.addParameter('pictureURL', TYPES.VarChar, actorInfo.pictureURL);

    connection.execSql(requestUpdate);
}

function deleteActorById(connection, response, id) {
    let DELETEACTOR = `DELETE FROM actors WHERE actorId = @id`;
    let requestDelete = new Request(DELETEACTOR, function(err) {
        if(err) throw err;
    });

    requestDeletet.on('requestCompleted', function() {
        let message = "Successfully deleted actor entry";
        resource.updateRequest(connection, response, message, resource.requests["del_actorId"]);
    });

    requestDelete.addParameter('id', TYPES.VarChar, id)
    connection.execSql(requestDelete);
    console.log("Deletion completed!");
}

app.get(endPoint + "actor", function(req, res) {
    console.log('Getting list of actors!');
    getActors(connection, res);
});

app.post(endPoint + "actor", checkJwt, function(req, res) {
    console.log('Adding a new actor!');
    let body = '';
    req.on('data', data => {
        body += data;
        body = JSON.parse(body);
        console.log(body);
        try {
            addActor(connection, res, body);
        } catch(e) {
            res.status(500);
            res.send("Error: Couldn't add a new actor")
        }
    });
});

app.put(endPoint + "actor/:id", checkJwt, function(req, res) {
    console.log('Updating specified actor with id: ' + req.params.id);
    let body = '';
    req.on('data', data => {
        body += data;
        body = JSON.parse(body);
        console.log(body);
        try {
            updateActor(connection, res, body);
        }
        catch(e) {
            res.status(500);
            res.send("Error: Couldn't update the actor")
        }
    });
});

app.get(endPoint + "actor/:id", checkJwt, function(req, res) {
    console.log('Getting specified actor with id: ' + req.params.id);
    getActorById(connection, res, req.params.id);
});

app.delete(endPoint + "actor/:id", checkJwt, function(req, res) {
    console.log('Deleting specified actor with id: ' + req.params.id);
    deleteActorById(connection, res, req.params.id);
});

module.exports = app;