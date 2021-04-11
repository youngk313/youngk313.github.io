const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;
const classes = require('./classes');
const dbs = require('./connect');
const resource = require('./resource');
const checkJwt = require('./checkJWT');

const app = require('./actor');
const endPoint = "/API/v1/";

connection = dbs.createConnection();

function getReviewById(connection, response, id) {
    const Q_REVIEW = `SELECT * FROM reviews WHERE movieId = @id`;
    let review_info = [];
    let requestSelect = new Request(Q_REVIEW, function(err, result) {
        if(err) console.log(err);
    })
    requestSelect.on('row', (columns) => {
        let review = new classes.Review(columns);
        review_info.push(review);
    });

    requestSelect.on('requestCompleted', function() {
        if (review_info.length > 0) {
            console.log("Reviews retrieved successfully");
            resource.updateRequest(connection, response, JSON.stringify(review_info), resource.requests["get_review"]);
        }
        else {
            response.status(404);
            response.send("No reviews in database");
        }
    });

    requestSelect.addParameter('id', TYPES.Int, id);
    connection.execSql(requestSelect);
}

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
            console.log("Reviews retrieved successfully");
            resource.updateRequest(connection, response, JSON.stringify(review_info), resource.requests["get_review"]);
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
        let message = "Review added successfully";
        resource.updateRequest(connection, response, message, resource.requests["post_review"]);
    });

    requestInsert.addParameter('id', TYPES.Int, reviewInfo.movieId);
    requestInsert.addParameter('comment', TYPES.VarChar, reviewInfo.comment);
    requestInsert.addParameter('rating', TYPES.Int, reviewInfo.rating);

    connection.execSql(requestInsert);
    console.log("Insertion completed!");
}

function updateReview(connection, response, reviewInfo, id) {
    const UPDATEREVIEW = `UPDATE reviews SET comment = @comment, rating = @rating, movieId = @movieId WHERE reviewId = @id`;
    let review_info;
    let requestUpdate = new Request(UPDATEREVIEW, function(err, result) {
        if(err) throw err;
    })
    
    requestUpdate.on('row', (columns) => {
        review_info = new classes.Review(columns);
    })

    requestUpdate.on('requestCompleted', function() {
        let message = "Review added";
        resource.updateRequest(connection, response, message, resource.requests["put_review"]);
    });

    requestUpdate.addParameter('id', TYPES.Int, id);
    requestUpdate.addParameter('movieId', TYPES.Int, reviewInfo.movieId);
    requestUpdate.addParameter('comment', TYPES.VarChar, reviewInfo.comment);
    requestUpdate.addParameter('rating', TYPES.Int, reviewInfo.rating);

    connection.execSql(requestUpdate);
}

app.get(endPoint + "review", checkJwt, function(req, res) {
    console.log('Getting reviews');
    try{
        getReviews(connection, res);
    } 
    catch(e) {
        res.status(500)
        res.send("Error: could not handle requests.")
    }
});

app.post(endPoint + "review", checkJwt, function(req, res) {
    console.log('Adding a review!');
    let body = '';
    req.on('data', data => {
        body += data;
        body = JSON.parse(body);
        console.log(body);
    });

    req.on('end', () => {
        try {
            addReview(connection, res, body);
        }
        catch (e) {
            res.status(400);
            res.send("Could not add the review");
        }
    });
});

app.get(endPoint + "review/:id", checkJwt, function(req, res) {
    console.log('Getting reviews of the movie: ' + req.params.id);
    try {
        getReviewById(connection, res, req.params.id);
    } catch(e) {
        if (e) {
            res.status(500);
            res.send("Error: server can't handle that many requests ")
        }
    }
});

app.put(endPoint + "review/:id", checkJwt, function(req, res) {
    console.log('Updating specified review with id: ' + req.params.id);
    let body = '';
    req.on('data', data => {
        body += data;
        body = JSON.parse(body);
        console.log(body);
    });

    req.on('end', () => {
        try {
            updateReview(connection, res, body, req.params.id);
        }
        catch (e) {
            res.status(400);
            res.send("Could not update the review");
        }
    });
});

module.exports = app;