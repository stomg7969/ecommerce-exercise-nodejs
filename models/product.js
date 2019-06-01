// Using this method, now I can get an access to db.
const mongodb = require('mongodb');
const getDb = require('../helper/database').getDb;

class Product {
	constructor(title, price, description, imageUrl) {
		this.title = title;
		this.price = price;
		this.description = description;
		this.imageUrl = imageUrl;
	}
	save() {
		const db = getDb();
		// .collection() is to tell MongoDB into which collection I want to insert or with which collection I want to work.
		// IMPORTANT: in MongoDB I have Databases, Collections, Documents. 
		return db.collection('products').insertOne(this)
			.then(r => {
				console.log('READY TO DELETEDELETEDELTEDELETE');
			})
			.catch(err => console.log('PROD MODEL SAVE ERR?', err));
	}
	static fetchAll() {
		const db = getDb();
		// .find is MongoDB's method. Empty argument at .find will return all products.
		// .find will return something called 'cursor', which is provided by MongoDB, which allows us to go through our elements/documents step by step.
		// So, to prevent from .find() to retrieve the entire products (a million products at once), I can use limitation method. Otherwise, .toArray().
		return db.collection('products').find().toArray()
			.then(products => {
				return products;
			})
			.catch(err => console.log('product FETCHALL ERR?', err));
	}
	static findById(id) {
		const db = getDb();
		// need .next() to get one as javascript format/syntax
		// It is not underscored. So dynamic route must change in the view file.
		// Underscore is because in MongoDB, id is stored as _id.
		return db.collection('products')
			// Also, MongoDB stores data in BSON format. That's why it's so disgusting looking.
			.find({ _id: new mongodb.ObjectId(id) })
			.next()
			.then(product => {
				return product;
			})
			.catch(err => console.log('model product findID ERR?', err));
	}
}

module.exports = Product;