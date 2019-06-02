// importing 'mongodb' because I need to create an id. MongoDB uses BSON and id is stored as ObjectId.
const mongodb = require('mongodb');
const getDb = require('../helper/database').getDb;

class User {
    constructor(username, email) {
        this.name = username;
        this.email = email;
    }
    save() {
        const db = getDb();
        return db.collection('users').insertOne(this);
    }
    static findById(id) {
        const db = getDb();
        return db.collection('users')
            // .find({ _id: new mongodb.ObjectId(id) }).next();
            // This is the same as ...
            .findOne({ _id: new mongodb.ObjectId(id) });
        // .find may return multiple, that is why .next() is necessary.
    }
}

module.exports = User;