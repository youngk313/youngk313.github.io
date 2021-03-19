CREATE TABLE questionList (
    qID int NOT NULL IDENTITY(1,1) PRIMARY KEY,
    question VARCHAR(200)
);

CREATE TABLE answerList (
    aID int NOT NULL IDENTITY(1,1) PRIMARY KEY,
    qID int NOT NULL,
    answer VARCHAR(100),
    correct BIT NOT NULL,
    FOREIGN KEY(qID) REFERENCES questionList(qID)
);