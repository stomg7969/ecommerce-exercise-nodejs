const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  console.log("ADMIN, ADD PRODUCT...");
  // res.send(
  // '<form action="/admin/product" method="POST"><input type="text" name="title" /><button type="submit">Add Product</button></form>'
  // );
  // next() argument allows the request to continue to the next middleware in line
  // We can't use next() when response is already called. Will get an error.
  // BELOW: when I use plain html
  // res.sendFile(path.join(rootDir, 'views', 'product.html'));
  // BELOW: when I use pug template.
  res.render("admin/edit-product", {
    pageTitle: "ADD PRODUCT",
    path: "/admin/add-product",
    editing: false
  });
};

exports.postAddProduct = (req, res) => {
  // renders after submitting.
  console.log('ADMIN POST CONTROLLER ', req.body); // this is undefined unless I have parse.
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  // const { title, imageUrl, price, description } = req.body;
  const product = new Product(null, title, imageUrl, description, price);
  product.save()
    .then(() => {
      res.redirect("/");
    })
    .catch(err => console.log('HAS ERR IN ADMIN CTRL?', err));
};

exports.getEditProduct = (req, res, next) => {
  // .query is for checking query params in the url.
  // so this path will work only when url has .../:id?edit=true
  const editMode = req.query.edit;
  console.log("DOES QUERY URL HAS '?edit=true'?", editMode)
  if (!editMode) return res.redirect('/');

  const prodId = req.params.productId;
  Product.findById(prodId, product => {
    if (!product) return res.redirect('/');
    res.render('admin/edit-product', {
      pageTitle: 'Edit PRODUCT',
      path: '/admin/edit-product',
      editing: editMode,
      product: product
    });
    // Remember, res.render is what I send information to view pages.
  });
};

exports.postEditProduct = (req, res, next) => {
  const { productId, title, price, imageUrl, description } = req.body;
  const updatedProduct = new Product(productId, title, imageUrl, description, price);
  updatedProduct.save();
  // Instead of redirecting all the time, validate if .save() or .delete() is successful first.
  res.redirect('/admin/products');
};

exports.postDeleteProduct = (req, res) => {
  console.log('DELETING(in admin contlr).', req.body);
  // I am also passing price to update cart.
  // this is something I am trying on my own, not instructor's
  const { productId, productPrice } = req.body;
  Product.delete(productId, parseFloat(productPrice));
  res.redirect('/admin/products');
}

exports.getProducts = (req, res, next) => {
  console.log('Product list for admin')
    Product.fetchAll(products => {
        res.render('admin/products', {
            products: products,
            pageTitle: 'Admin Products',
            path: '/admin/products'
        })
    })
};