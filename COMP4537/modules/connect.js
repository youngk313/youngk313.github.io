const Connection = require('tedious').Connection;

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
    }).on('errorMessage', function(err) {
        console.log('Error');
    });
    connection.connect();
    return connection;
}

module.exports = {
    createConnection
}