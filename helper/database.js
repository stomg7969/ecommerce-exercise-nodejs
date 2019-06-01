const dotenv = require('dotenv');
dotenv.config();
// this file is for MongoDB exercise.
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
// underscore is a signal that it will only be used internally in this file.
let _db;

const mongoConnect = (cb) => {
  // Make sure to change password
  MongoClient.connect('mongodb+srv://jane:jane@cluster0-kl0m7.mongodb.net/shop?retryWrites=true&w=majority', { useNewUrlParser: true })
    .then(client => {
      console.log('CONNECTED YO');
      _db = client.db(); // Since I did this, instead of connecting to 'test' (...mongodb.net/test?...) --> 'shop'.
      // it will now give me an access to shop db. If want something else, for example back to test, then it'll be, client.db('test').
      cb();
    })
    .catch(err => {
      console.log('database CONNECTION ERR?', err)
      throw err;
    });
};
const getDb = () => {
  if (_db) {
    return _db;
  }
  throw 'No db found.';
}

// module.exports = mongoConnect;
exports.mongoConnect = mongoConnect;
exports.getDb = getDb; 