const db = require('../helper/database');

const Cart = require('./cart');

module.exports = class Product {
    constructor(id, title, imageUrl, description, price) {
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }
    // .readFile, .writeFile are asynchronous.
    save() {
        // Model only returns the db, rest is controller's responsibility.
        return db.execute('INSERT INTO products (title, price, description, imageUrl) VALUES (?, ?, ?, ?)', 
        [this.title, this.price, this.description, this.imageUrl]
        );
    }

    static delete() {
        
    }

    static fetchAll() {
        return db.execute('SELECT * FROM products');
    }

    static findById(id) {
        return db.execute('SELECT * FROM products WHERE products.id = ?', [id]);
    }
};