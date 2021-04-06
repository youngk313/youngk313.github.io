const Request = require('tedious').Request;
const classes = require('./classes');
const dbs = require('./connect');

const app = require('./actor');
const endPoint = "/API/v1/";

let reviewRequest = {
    "review": {
        'GET': 0,
        'POST': 0,
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
            reviewRequest.review.GET++;
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
    const INSERTREVIEW = `IF NOT EXISTS (SELECT * FROM reviews WHERE comment = '${reviewInfo.comment}')
    INSERT INTO reviews (movieId, comment, rating) VALUES (${reviewInfo.movieId}, '${reviewInfo.comment}', ${reviewInfo.rating});`;
    let requestInsert = new Request(INSERTREVIEW, function(err) {
        if(err) throw err;
    });

    requestInsert.on('requestCompleted', function() {
        response.status(200);
        response.send("Review added")
    });

    connection.execSql(requestInsert);
    console.log("Insertion completed!");
}

function updateReview(connection, response, reviewInfo) {
    const UPDATEREVIEW = `UPDATE reviews SET comment = '${reviewInfo.comment}', rating = ${reivewInfo.rating}' WHERE reviewId = ${reviewInfo.id}`;
    let review_info;
    let requestSelect = new Request(UPDATEREVIEW, function(err, result) {
        if(err) throw err;
    })
    
    requestSelect.on('row', (columns) => {
        review_info = new classes.Review(columns);
    })

    requestSelect.on('requestCompleted', function() {
        getActorById(connection, response, reviewInfo.id);
    });

    connection.execSql(requestSelect);
}


app.get(endPoint + "review",  function(req, res) {
    console.log('Getting reviews');
    try{
        getReviews(connection, res);
    } 
    catch(e) {
        res.status(500)
        res.send("Error: could not handle requests.")
    }
    
});

app.post(endPoint + "review",  function(req, res) {
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

app.put(endPoint + "review/:id",  function(req, res) {
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