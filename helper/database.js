const dotenv = require('dotenv');
dotenv.config();
// // this file is for MySQL2 exercise.
// const mysql = require('mysql2');
// // pool can run multiple queries. It's a 'pool' of connections.
// // Always reach out to it whenever we have query to run.
// // Then it provides new connection.
// // createConnection is just one connection.
// const pool = mysql.createPool({
//     host: 'localhost',
//     user: 'root',
//     database: 'node-complete',
//     password: process.env.MYSQL_PW
// });
// // telling system that it is asynchronous
// module.exports = pool.promise();

// ------- ABOVE WAS DONE WITHOUT sequelize. 
// sequelize helps us to write SQL query easily.
const Sequelize = require('sequelize');
// connect to my data table name.
const sequelize = new Sequelize('node-complete', 'root', process.env.MYSQL_PW, { dialect: 'mysql', host: 'localhost' });

module.exports = sequelize;