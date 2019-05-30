// const path = require("path");
// const rootDir = require("../helper/path");
const Product = require("../models/product");
const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
  console.log("%c IN SHOP.JS...", "color: white; background-color: black");
  // *****
  // res.sendFile(path.join(rootDir, 'views', 'shop.html'));
  // two underscore + dirname => __dirname
  // Using express.js, we don't need to write res.setHeader() anymore.
  // ... we still can, but why would you? .send() does it by default.
  // *****
  Product.fetchAll(products => {
    res.render("shop/product-list", {
      products: products, 
      pageTitle: "ALL PRODUCTS", 
      path: "/products" 
    });
    // shop.pug, but by default it looks for .pug because of what I did in add.js.
    // the second argument is what we pass to the view.
  });
};
exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId, product => {
    res.render('shop/product-detail', { 
      product: product, 
      pageTitle: product.title,
      path: '/products'
    });
  });
}
exports.getIndex = (req, res, next) => {
  Product.fetchAll(products => {
    res.render("shop/index", {
      products: products,
      pageTitle: "Shop",
      path: "/"
    });
  });
}
exports.getCart = (req, res, next) => {
  // Here, I am rendering list of products that is in the cart.json.
  // But I also have to fetch from products because cart.json doesn't contain detail product info.
  // So I will get products that overlap, and modify product structure to fit to cart page.
  Cart.getCart(cart => {
    Product.fetchAll(products => {
      // by creating empty array, there won't be an error even if cart is empty.
      const cartProducts = [];
      for (const product of products) {
        const cartProductObj = cart.products.find(prod => prod.id === product.id);
        if (cartProductObj) {
          cartProducts.push({ product, qty: cartProductObj.qty })
        }
      }
      res.render('shop/cart', {
        pageTitle: 'Cart',
        path: '/cart',
        products: cartProducts
      });
    });
  });
}
exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId, product => {
    Cart.addProduct(prodId, product.price);
  });
  res.redirect('/cart');
};
exports.postCartDeleteProduct = (req, res) => {
  // Again, like delete product, I can use hidden input for price then pass it.
  // ... here, I will just follow along with instruction.
  const prodId = req.body.productId;
  // findById is static custom function.
  Product.findById(prodId, product => {
    Cart.deleteProduct(prodId, product.price);
    res.redirect('/cart');
  });
}
exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    pageTitle: 'Checkout',
    path: '/checkout'
  });
};
exports.getOrders = (req, res, next) => {
  res.render('shop/orders', {
    pageTitle: 'Orders',
    path: '/orders'
  });
};