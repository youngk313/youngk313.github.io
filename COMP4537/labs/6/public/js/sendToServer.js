const Connection = require('tedious').Connection;
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;

let currentQIDs = [];

const config = {
    server: "ykwon-sql.database.windows.net",
    authentication: {
       type: 'default',
       options: {
           userName: "ykwon",
           password: "Korea980!"
       } 
    },
    options: {
        encrypt: true,
        database: "ykwon-sql"
    }
};

function createConnection() {
    const connection = new Connection(config);
    connection.on('connect', function(err) {
        if(err) throw err;
        console.log("Connected!");
    });
    connection.connect();
    return connection;
}

function connectToDB(connection, q, operation, response) {
    switch(operation) {
        case "insert":
            insertQuestion(connection, q, response, storeID, getQID);
            break;
        case "delete":
            deleteQuestion(connection, q);
            break;
        case "get":
            getAll(connection, response);
            break;
        case "update":
            updateQuestion(connection, q)
    }
}

function storeID(result, response) {
    currentQIDs.push(result);
    response.send(String(result))
    console.log(currentQIDs);
}

function insertQuestion(connection, q, response, storeID, callback=null) {
    const INSERTQUEST = `IF NOT EXISTS (SELECT * FROM questionList WHERE question = '${q.question}')
    INSERT INTO dbo.questionList (question) VALUES ('${q.question}');`;
    let requestInsert = new Request(INSERTQUEST, function(err) {
        if(err) throw err;
    });

    requestInsert.on('requestCompleted', function() {
        if (callback != null)
            callback(connection, q, response, storeID, insertAnswers);
    });

    requestInsert.addParameter('question', TYPES.NVarChar);
    connection.execSql(requestInsert);
    console.log("Insertion completed!");
}

function updateQuestion(connection, q) {
    const UPDATEQUEST = `UPDATE questionList SET question = '${q.question}' WHERE qID = ${q.id}`;
    let requestUpdate = new Request(UPDATEQUEST, function(err) {
        if(err) throw err;
    });

    requestUpdate.on('requestCompleted', function() {
        updateAnswers(connection, q)
    });
    connection.execSql(requestUpdate);
    console.log("Update completed!");
}

function updateAnswers(connection, q) {
    let UPDATEANS = '';
    for (let i = 0; i < q.answerIDs.length; ++i) 
        UPDATEANS += `UPDATE answerList SET answer = '${q.answers[i]}' WHERE qID = ${q.id} AND aID = ${q.answerIDs[i]}; `;
    let newRequest = new Request(UPDATEANS, function(err) {
        if (err) throw err;
    });

    connection.execSql(newRequest);
    
}

function deleteQuestion(connection, q) {
    let  DELETEQUEST= `DELETE FROM answerList WHERE qID = ${q.id};`;
    DELETEQUEST += `DELETE FROM questionList WHERE qID = ${q.id}`;
    let requestDelete = new Request(DELETEQUEST, function(err) {
        if(err) throw err;
    });

    connection.execSql(requestDelete);
    console.log("Deletion completed!");
}

function getQID(connection, q, response, storeID, callback=null) {
    const GETQID = `SELECT MAX(qID) FROM questionList WHERE question = '${q.question}'`;
    let requestSelect = new Request(GETQID, function(err, result) {
        if(err) throw err;
    })
    requestSelect.on('row', (columns) => {
        storeID(columns[0].value, response);
    })

    requestSelect.on('requestCompleted', function() {
        if (callback != null)
            callback(connection, q, storeID);
    });

    connection.execSql(requestSelect);
}

function getAll(connection, response) {
    const GETANS = "SELECT * FROM answerList ORDER BY qID";
    const GETQ = "SELECT question FROM questionList";
    let information = {'questions': [], 'aIDs': [], 'qIDs': [], 'answers': [], 'correct': []};
    let requestSelect = new Request(GETQ, function(err, result) {
        if(err) throw err;
    })
    requestSelect.on('row', (columns) => {
        information.questions.push(columns[0].value);
    });

    requestSelect.on('requestCompleted', function() {
        let requestAns = new Request(GETANS, function(err, result) {
            if(err) throw err;
        })
        requestAns.on('row', (columns) => {
            information.aIDs.push(columns[0].value)
            information.qIDs.push(columns[1].value);
            information.answers.push(columns[2].value);
            information.correct.push(columns[3].value);
        });
        requestAns.on('requestCompleted', function() {
            response.send(JSON.stringify(information));
        });
        connection.execSql(requestAns);
    });

    connection.execSql(requestSelect);

}

function insertAnswers(connection, q) {
    let INSERTANS = `INSERT INTO answerList (qID, answer, correct) VALUES `;
    for (let i = 0; i < q.answers.length; ++i) {
        INSERTANS += `(${currentQIDs[currentQIDs.length - 1]}, '${q.answers[i]}', ${String.fromCharCode(65 + i) == q.correct ? 1 : 0}) `
        if (i != q.answers.length - 1)
            INSERTANS += ', '
    }

    request = new Request(INSERTANS, function(err) {
        if(err) throw err;
    });

    request.addParameter('qID', TYPES.Numeric);
    request.addParameter('answer', TYPES.NVarChar);
    connection.execSql(request);
}

module.exports = {
    currentQIDs,
    createConnection,
    connectToDB
}
