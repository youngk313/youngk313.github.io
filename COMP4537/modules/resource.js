const Request = require('tedious').Request;

const requests = {
    "get_movie": 1,
    "post_movie": 2,
    "get_movieId": 3,
    "put_movieId": 4,
    "del_movieId": 5,
    "get_mov_genre": 6,
    "get_actor": 7,
    "post_actor": 8,
    "get_actorId": 9,
    "put_actorId": 10,
    "del_actorId": 11,
    "get_review": 12,
    "post_review": 13,
    "put_review": 14,
    "get_cast": 15,
    "post_cast": 16
};


function updateRequest(connection, response, message, id) {
    const update = `UPDATE requests SET count = count + 1 WHERE id = ${id}`;
    
    let requestUpdate = new Request(update, function(err, result) {
        if (err) throw err;
    });

    requestUpdate.on('requestCompleted', function() { 
        response.status(200);
        response.send(message);
    });

    connection.execSql(requestUpdate);
}

module.exports = {
    updateRequest,
    requests
};