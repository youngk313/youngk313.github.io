class Movie {
    constructor(movieInfo) {
        this.movieId = movieInfo[0].value;
        this.title = movieInfo[1].value;
        this.year = movieInfo[2].value;
        this.genre = movieInfo[3].value;
    }
}

class Cast {
    constructor(castInfo) {
        this.movieId = castInfo[0].value;
        this.actorId = castInfo[1].value;
        this.role = castInfo[2].value;
    }
}

class Actor {
    constructor(actorInfo) {
        this.actorId = actorInfo[0].value;
        this.fullname = actorInfo[1].value;
        this.year = actorInfo[2].value;
        this.pictureURL = actorInfo[3].value;
    }
}

class Review {
    constructor(reviewInfo) {
        this.reviewId = reviewInfo[0].value;
        this.movieId = reviewInfo[1].value;
        this.comment = reviewInfo[2].value;
        this.rating = reviewInfo[3].value;
    }
}

class Resource {
    constructor(reqInfo) {
        this.endPoint = reqInfo[1].value;
        this.reqType = reqInfo[2].value;
        this.count = reqInfo[3].value;
    }
}

module.exports = {
    Movie,
    Cast,
    Actor,
    Review,
    Resource
}