const fs = require('fs');
const path = require('path');
const rootDir = require("../helper/path");
const p = path.join(rootDir, "data", "products.json");

const Cart = require('./cart');

// reads the json file from products.json
// will then return callback function with the arguments "DEPENDING ON IF THEY EXIST".
const getProductsFromFile = cb => {
    fs.readFile(p, (err, fileContent) => {
        return err ? cb([]) : cb(JSON.parse(fileContent));
        // the cb will provide one of the above two arguments.
    });
}

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
        getProductsFromFile(products => {
            if (this.id) {
                // this is where PATCH request is being done.
                // because PATCHING means there is an id.
                const existingProductIndex = products.findIndex(prod => prod.id === this.id);
                const updatedProducts = [...products];
                updatedProducts[existingProductIndex] = this;
                fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
                    console.log('UPDATE ERR IN PRODUCT MODEL ', err);
                });
            } else {
                // POST request is being done.
                // need to create new ID since new product is being added.
                this.id = Math.random().toString();
                products.push(this);
                fs.writeFile(p, JSON.stringify(products), (err) => {
                    console.log('POST ERR IN PRODUCT MODEL ', err);
                });
            }
        });
    }

    static delete(id, price) {
        getProductsFromFile(products => {
            // Instructor used products.find to just get price.
            // ... instead, I am bringing from view file(hidden input) to ctrl to here by passing as an argument.
            // const product = products.find(prod => prod.id === id);
            const updatedProducts = products.filter(prod => prod.id !== id);
            fs.writeFile(p, JSON.stringify(updatedProducts), err => {
                console.log('DELETE ERR IN PRODUCT MODEL ', err);
                if (!err) {
                    Cart.deleteProduct(id, price)
                }
            });
        });
    }

    static fetchAll(cb) {
        // called from controller, calls getProductsFromFile with cb as an argument.
        getProductsFromFile(cb);
        // cb will have argument. The arguments are either [] or returned data.
    }

    static findById(id, cb) {
        getProductsFromFile(products => {
            const product = products.find(p => p.id === id);
            cb(product);
        });
    }
};