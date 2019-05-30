// this file is for MySQL2 exercise.
const mysql = require('mysql2');
// pool can run multiple queries. It's a 'pool' of connections.
// Always reach out to it whenever we have query to run.
// Then it provides new connection.
// createConnection is just one connection.
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'node-complete',
    password: 'Tmxld32923@'
});
// telling system that it is asynchronous
module.exports = pool.promise();