// const path = require("path");
// const rootDir = require("../helper/path");
const Product = require("../models/product");
const Cart = require("../models/cart");

exports.getProducts = (req, res, next) => {
  console.log(
    "%c All products(shop ctrl)",
    "color: white; background-color: black"
  );
  Product.fetchAll()
    .then(([rows, fieldData]) => {
      res.render("shop/product-list", {
        products: rows,
        pageTitle: "ALL PRODUCTS",
        path: "/products"
      });
    })
    .catch(err => console.log("HAS ERR IN getProducts?", err));
};
exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    //  Reason for [product] is ... it's like const { value } = req.body;
    .then(([product]) => {
      res.render("shop/product-detail", {
        // [product] will return the first element only, but in array. So I need to get the first index.
        product: product[0],
        pageTitle: product.title,
        path: "/products"
      });
    })
    .catch(err => console.log("HAS ERR IN getProduct?", err));
};
exports.getIndex = (req, res, next) => {
  // Remember that the data is stored in first element. Instructor calls it rows.
  Product.fetchAll()
    // fieldData can be deleted, but let it be there so I don't forget.
    .then(([rows, fieldData]) => {
      res.render("shop/index", {
        products: rows,
        pageTitle: "Shop",
        path: "/"
      });
    })
    .catch(err => console.log("HAS ERR IN getIndex?", err));
};
exports.getCart = (req, res, next) => {
  // Here, I am rendering list of products that is in the cart.json.
  // But I also have to fetch from products because cart.json doesn't contain detail product info.
  // So I will get products that overlap, and modify product structure to fit to cart page.
  Cart.getCart(cart => {
    Product.fetchAll(products => {
      // by creating empty array, there won't be an error even if cart is empty.
      const cartProducts = [];
      for (const product of products) {
        const cartProductObj = cart.products.find(
          prod => prod.id === product.id
        );
        if (cartProductObj) {
          cartProducts.push({ product, qty: cartProductObj.qty });
        }
      }
      res.render("shop/cart", {
        pageTitle: "Cart",
        path: "/cart",
        products: cartProducts
      });
    });
  });
};
exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId, product => {
    Cart.addProduct(prodId, product.price);
  });
  res.redirect("/cart");
};
exports.postCartDeleteProduct = (req, res) => {
  // Again, like delete product, I can use hidden input for price then pass it.
  // ... here, I will just follow along with instruction.
  const prodId = req.body.productId;
  // findById is static custom function.
  Product.findById(prodId, product => {
    Cart.deleteProduct(prodId, product.price);
    res.redirect("/cart");
  });
};
exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    pageTitle: "Checkout",
    path: "/checkout"
  });
};
exports.getOrders = (req, res, next) => {
  res.render("shop/orders", {
    pageTitle: "Orders",
    path: "/orders"
  });
};
