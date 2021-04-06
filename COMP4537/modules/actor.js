const Request = require('tedious').Request;
const dbs = require('./connect');
const app = require('./movie');
const endPoint = "/API/v1/"

connection = dbs.createConnection();

function getActors(connection, response) {
    const Q_ACTORS = `SELECT * FROM actors`;
    let actor_info = [];
    let requestSelect = new Request(Q_ACTORS, function(err, result) {
        if(err) throw err;
    })
    requestSelect.on('row', (columns) => {
        let actor = new Actor(columns);
        actor_info.push(actor);
    })

    requestSelect.on('requestCompleted', function() {
        response.send(JSON.stringify(actor_info));
    });

    connection.execSql(requestSelect);
}

function addActor(connection, response, actorInfo) {
    const INSERTACTOR = `IF NOT EXISTS (SELECT * FROM actors WHERE fullname = '${actorInfo.fullname}')
    INSERT INTO actors (fullname, age, pictureURL) VALUES ('${actorInfo.fullname}', ${actorInfo.age}, '${actorInfo.pictureURL}');`;
    let requestInsert = new Request(INSERTACTOR, function(err) {
        if(err) throw err;
    });

    requestInsert.on('requestCompleted', function() {
        response.status(200)
        response.send("Actor added successfully")
    });

    connection.execSql(requestInsert);
    console.log("Insertion completed!");
}

function getActorById(connection, response, id) {
    const GETACTOR = `SELECT * FROM actors WHERE actorId = ${id}`;
    let actor_info;
    let requestSelect = new Request(GETACTOR, function(err, result) {
        if(err) throw err;
    })
    requestSelect.on('row', (columns) => {
        actor_info = new Actor(columns);
    })

    requestSelect.on('requestCompleted', function() {
        response.send(JSON.stringify(actor_info));
    });

    connection.execSql(requestSelect);
}

function updateActor(connection, response, actorInfo) {
    const UPDATEACTOR = `UPDATE actors SET fullname = '${actorInfo.fullname}', age = ${actorInfo.age}, pictureURL = '${actorInfo.pictureURL}' WHERE actorId = ${actorInfo.id}`;
    let actor_info;
    let requestSelect = new Request(UPDATEACTOR, function(err, result) {
        if(err) throw err;
    })
    
    requestSelect.on('row', (columns) => {
        actor_info = new Actor(columns);
    })

    requestSelect.on('requestCompleted', function() {
        response.status(200);
        response.send("Successfully updated actor entry");
    });

    connection.execSql(requestSelect);
}

function deleteActorById(connection, response, id) {
    let DELETEACTOR = `DELETE FROM actors WHERE actorId = ${id}`;
    let requestDelete = new Request(DELETEACTOR, function(err) {
        if(err) throw err;
    });

    requestSelect.on('requestCompleted', function() {
        response.status(200);
        response.send("Successfully deleted actor entry");
    });

    connection.execSql(requestDelete);
    console.log("Deletion completed!");
}

app.get(endPoint + "actor",  function(req, res) {
    console.log('Getting list of actors!');
    getActors(connection, res);
});

app.post(endPoint + "actor",  function(req, res) {
    console.log('Adding a new actor!');
    let body = '';
    req.on('data', data => {
        body += data;
        body = JSON.parse(body);
        console.log(body);
    });

    req.on('end', () => {
        try {
            addActor(connection, res, body);
        } catch(e) {
            res.status(500);
            res.send("Error: Server can't handle that many requests")
        }
        
    });
});

app.put(endPoint + "actor/:id",  function(req, res) {
    console.log('Updating specified actor with id: ' + req.params.id);
    let body = '';
    req.on('data', data => {
        body += data;
        body = JSON.parse(body);
        console.log(body);
    });

    req.on('end', () => {
        updateActor(connection, res, body);
    });
});

app.get(endPoint + "actor/:id",  function(req, res) {
    console.log('Getting specified actor with id: ' + req.params.id);
    getActorById(connection, res, req.params.id);
});

app.delete(endPoint + "actor/:id",  function(req, res) {
    console.log('Deleting specified actor with id: ' + req.params.id);
    deleteActorById(connection, res, req.params.id);
});

module.exports = app;