const fs = require('fs');
const path = require('path');
const rootDir = require('../helper/path');

const p = path.join(rootDir, 'data', 'cart.json');

module.exports = class Cart {
    static addProduct(id, productPrice) {
        // Fetch the previous cart
        fs.readFile(p, (err, fileContent) => {
            let cart = { products: [], totalPrice: 0 };
            if (!err) {
                cart = JSON.parse(fileContent);
            }
            // Analyze the cart => Find existing product
            // I use findIndex() because the cart needs to update an item if it already exist. 
            // So we need the index to located that item.
            const existingProductIndex = cart.products.findIndex(prod => prod.id === id);
            const existingProduct = cart.products[existingProductIndex];
            let updatedProduct;
            // Add new product / increase quantity
            if (existingProduct) {
                // When going into the cart, the product should also have quantity.
                // So that is what .qty is about.
                updatedProduct = { ...existingProduct };
                updatedProduct.qty = updatedProduct.qty + 1;
                cart.products = [...cart.products];
                cart.products[existingProductIndex] = updatedProduct;
            } else {
                updatedProduct = { id: id, qty: 1 };
                cart.products = [...cart.products, updatedProduct];
            }
            // Adding '+' in front of string of number, will convert it into an integer.
            cart.totalPrice = cart.totalPrice + +productPrice;
            fs.writeFile(p, JSON.stringify(cart), err => {
            console.log("Is there error? in cart model", err)
            });
        });
      
    };

    static deleteProduct(id, productPrice) {
        // price is passed because I need to update total price in cart.
        fs.readFile(p, (err, fileContent) => {
            if (err) return;
            const updatedCart = { ...JSON.parse(fileContent) };
            const product = updatedCart.products.find(prod => prod.id === id);
            if (!product) return; // reason for this line: As an admin, when I delete a product that is not in the cart,
                                  // it will cause an error because the function also delete the product in case it is in the cart too.
                                  // so it gives an error. Thus, with this line, it will stop here.
            const productQty = product.qty;
            
            updatedCart.products = updatedCart.products.filter(prod => prod.id !== id);
            updatedCart.totalPrice = updatedCart.totalPrice - productPrice * productQty;

            fs.writeFile(p, JSON.stringify(updatedCart), err => {
                console.log('DELETING ITEM FROM CART HAS ERR?', err);
            });
        });
    };

    static getCart(cb) {
        fs.readFile(p, (err, fileContent) => {
            const cart = JSON.parse(fileContent);
            err ? cb(null) : cb(cart);
            // if (err) {
            //     cb(null);
            // } else {
            //     cb(cart);
            // }
        });
    }
};