const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;
const classes = require('./classes');
const checkJwt = require('./checkJWT');
const dbs = require('./connect');

const app = require('./actor');
const endPoint = "/API/v1/";

let reviewRequest = {
    "review": {
        'GET': 0,
        'POST': 0,
    },
    "review/id": {
        'PUT': 0,
    }
};

connection = dbs.createConnection();

function getReviews(connection, response) {
    const Q_REVIEW = `SELECT * FROM reviews`;
    let review_info = [];
    let requestSelect = new Request(Q_REVIEW, function(err, result) {
        if(err) throw err;
    })
    requestSelect.on('row', (columns) => {
        let review = new classes.Review(columns);
        review_info.push(review);
    });

    requestSelect.on('requestCompleted', function() {
        if (review_info.length > 0) {
            response.status(200);
            reviewRequest["review"].GET++;
            response.send(JSON.stringify(review_info));
        }
        else {
            response.status(404);
            response.send("No reviews in database");
        }
    });

    connection.execSql(requestSelect);
}

function addReview(connection, response, reviewInfo) {
    const INSERTREVIEW = `IF NOT EXISTS (SELECT * FROM reviews WHERE comment = @comment)
    INSERT INTO reviews (movieId, comment, rating) VALUES (@id, @comment, @rating);`;
    let requestInsert = new Request(INSERTREVIEW, function(err) {
        if(err) throw err;
    });

    requestInsert.on('requestCompleted', function() {
        reviewRequest["review"].POST++;
        response.status(200);
        response.send("Review added");
    });

    requestInsert.addParameter('id', TYPES.Int, reviewInfo.movieId);
    requestInsert.addParameter('comment', TYPES.VarChar, reviewInfo.comment);
    requestInsert.addParameter('rating', TYPES.Int, reviewInfo.rating);

    connection.execSql(requestInsert);
    console.log("Insertion completed!");
}

function updateReview(connection, response, reviewInfo) {
    const UPDATEREVIEW = `UPDATE reviews SET comment = @comment, rating = @rating, movieId = @movieId WHERE reviewId = @id`;
    let review_info;
    let requestUpdate = new Request(UPDATEREVIEW, function(err, result) {
        if(err) throw err;
    })
    
    requestUpdate.on('row', (columns) => {
        review_info = new classes.Review(columns);
    })

    requestUpdate.on('requestCompleted', function() {
        reviewRequest["review/id"].PUT++;
        response.status(200);
        response.send("Review added");
    });

    requestUpdate.addParameter('id', TYPES.Int, reviewInfo.reviewId);
    requestUpdate.addParameter('movieId', TYPES.Int, reviewInfo.movieId);
    requestUpdate.addParameter('comment', TYPES.VarChar, reviewInfo.comment);
    requestUpdate.addParameter('rating', TYPES.Int, reviewInfo.rating);

    connection.execSql(requestUpdate);
}

app.get(endPoint + "review", function(req, res) {
    console.log('Getting reviews');
    try{
        getReviews(connection, res);
    } 
    catch(e) {
        res.status(500)
        res.send("Error: could not handle requests.")
    }
});

app.get(endPoint + "review/requests", checkJwt, function(req, res) {
    console.log("Returning number of requests");
    res.send(JSON.stringify(reviewRequest));
});

app.post(endPoint + "review", function(req, res) {
    console.log('Adding a review!');
    let body = '';
    req.on('data', data => {
        body += data;
        body = JSON.parse(body);
        console.log(body);
    });

    req.on('end', () => {
        addReview(connection, res, body);
    });
});

app.put(endPoint + "review/:id", function(req, res) {
    console.log('Updating specified review with id: ' + req.params.id);
    let body = '';
    req.on('data', data => {
        body += data;
        body = JSON.parse(body);
        console.log(body);
    });

    req.on('end', () => {
        updateReview(connection, res, body);
    });
});

module.exports = app;