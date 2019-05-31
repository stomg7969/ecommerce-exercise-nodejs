// COMMENTED OUT SECTION IS FOR USING PLAIN SQL QUERIES. 

// const db = require('../helper/database');
// const Cart = require('./cart');
// module.exports = class Product {
// 	constructor(id, title, imageUrl, description, price) {
// 		this.id = id;
// 		this.title = title;
// 		this.imageUrl = imageUrl;
// 		this.description = description;
// 		this.price = price;
// 	}
// 	// .readFile, .writeFile are asynchronous.
// 	save() {
// 		// Model only returns the db, rest is controller's responsibility.
// 		// Of course, instead of using plain SQL commands / syntax, I can use third party npm to make my life easier.
// 		return db.execute('INSERT INTO products (title, price, description, imageUrl) VALUES (?, ?, ?, ?)', [
// 			this.title,
// 			this.price,
// 			this.description,
// 			this.imageUrl
// 		]);
// 	}
// 	static delete() { }
// 	static fetchAll() {
// 		return db.execute('SELECT * FROM products');
// 	}
// 	static findById(id) {
// 		return db.execute('SELECT * FROM products WHERE products.id = ?', [id]);
// 	}
// };
// -------------------- SEQUELIZE ------------------------
const Sequelize = require('sequelize');
const sequelize = require('../helper/database');
// use .define() to create new model. Similar to class => new Product ...
// checkout sequelize documentation to see all possible properties.
const Product = sequelize.define('product', {
	id: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		allowNull: false,
		primaryKey: true
	},
	title: Sequelize.STRING,
	price: {
		type: Sequelize.DOUBLE,
		allowNull: false,
	},
	imageUrl: {
		type: Sequelize.STRING,
		allowNull: false
	},
	description: {
		type: Sequelize.STRING,
		allowNull: false
	}
});

module.exports = Product;