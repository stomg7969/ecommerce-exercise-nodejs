// Using this method, now I can get an access to db.
const mongodb = require('mongodb');
const getDb = require('../helper/database').getDb;

class Product {
	constructor(title, price, description, imageUrl, id) {
		this.title = title;
		this.price = price;
		this.description = description;
		this.imageUrl = imageUrl;
		this._id = id ? new mongodb.ObjectId(id) : null;
	}
	// right now, _id will always exist. I need ternary to make it null if id doesn't exist.
	save() {
		const db = getDb();
		let dbOp;
		if (this._id) {
			// Update the product --> for editing. 
			dbOp = db.collection('products')
				// also can be .updateMany if I want to update more than one.
				.updateOne({ _id: this._id }, { $set: this });
		} else {
			// .collection() is to tell MongoDB into which collection I want to insert or with which collection I want to work.
			// IMPORTANT: in MongoDB I have Databases, Collections, Documents. 
			dbOp = db.collection('products').insertOne(this)
		}
		return dbOp
		// Why would I need .then, .catch here when I already have one in controller?
		// .then(r => {
		// 	console.log('READY TO DELETEDELETEDELTEDELETE in the Product model');
		// })
		// .catch(err => console.log('PROD MODEL SAVE ERR?', err));
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
	static deleteById(id) {
		const db = getDb();
		db.collection('products').deleteOne({ _id: new mongodb.ObjectId(id) })
			.then(r => {
				console.log('Product Deleted');
			})
			.catch(err => console.log('product model delete ERR?', err));
	}
}

module.exports = Product;