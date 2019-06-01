const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
	console.log('ADMIN, ADD PRODUCT...');
	// res.send(
	// '<form action="/admin/product" method="POST"><input type="text" name="title" /><button type="submit">Add Product</button></form>'
	// );
	// next() argument allows the request to continue to the next middleware in line
	// We can't use next() when response is already called. Will get an error.
	// BELOW: when I use plain html
	// res.sendFile(path.join(rootDir, 'views', 'product.html'));
	// BELOW: when I use pug template. // path is just another prop that I pass, value can be anything
	res.render('admin/edit-product', {
		pageTitle: 'ADD PRODUCT',
		path: '/admin/add-product',
		editing: false
	});
};

exports.postAddProduct = (req, res) => {
	const { title, imageUrl, price, description } = req.body;
	const product = new Product(title, price, description, imageUrl);
	product.save()
		.then(() => {
			console.log('PRODUCT CREATED');
			res.redirect('/');
		})
		.catch((err) => console.log('HAS ERR IN ADMIN CTRL?', err));
	// -------------------- SEQUELIZE --------------------
	// I can create associated product to user.
	// req.user.createProduct({
	// 	title: title,
	// 	price: price,
	// 	imageUrl: imageUrl,
	// 	description: description
	// })
	// 	.then(result => {
	// 		console.log('Product created in admin ctrl');
	// 		res.redirect('/admin/products');
	// 	})
	// 	.catch(err => console.log('HAS ERR IN ADMIN CTRL postAddProd?', err));
};

// exports.getEditProduct = (req, res, next) => {
// 	// .query is for checking query params in the url.
// 	// so this path will work only when url has .../:id?edit=true
// 	const editMode = req.query.edit;
// 	console.log("DOES QUERY URL HAS '?edit=true'?", editMode);
// 	if (!editMode) return res.redirect('/');

// 	const prodId = req.params.productId;
// 	// Product.findByPk(prodId)
// 	req.user.getProducts({ where: { id: prodId } })
// 		.then(products => {
// 			const product = products[0];
// 			if (!product) return res.redirect('/');
// 			res.render('admin/edit-product', {
// 				pageTitle: 'Edit PRODUCT',
// 				path: '/admin/edit-product',
// 				editing: editMode,
// 				product: product
// 			});
// 			// Remember, res.render is what I send information to view pages.
// 		})
// 		.catch(err => {
// 			console.log('ADMIN EDIT PRD ERR?', err);
// 		})
// };

// exports.postEditProduct = (req, res, next) => {
// 	const { productId, title, price, imageUrl, description } = req.body;
// 	// const updatedProduct = new Product(productId, title, imageUrl, description, price);
// 	// updatedProduct.save();
// 	// res.redirect('/admin/products');
// 	// Instead of redirecting all the time, validate if .save() or .delete() is successful first.
// 	// ------------------- SEQUELIZE -------------------
// 	Product.findByPk(productId)
// 		.then(product => {
// 			product.title = title;
// 			product.price = price;
// 			product.imageUrl = imageUrl;
// 			product.description = description;
// 			return product.save();
// 		})
// 		.then(r => {
// 			console.log('Updated SUCCESS!');
// 			res.redirect('/admin/products');
// 		})
// 		.catch(err => console.log('ADMIN postEdit ERR?', err));
// };

// exports.postDeleteProduct = (req, res) => {
// 	console.log('DELETING(in admin contrl).', req.body);
// 	// I am also passing price to update cart.
// 	// this is something I am trying on my own, not instructor's
// 	const { productId, productPrice } = req.body;
// 	// Product.delete(productId, parseFloat(productPrice));
// 	// ------------- SEQUELIZE ---------------
// 	Product.findByPk(productId)
// 		// what about price?
// 		.then(product => product.destroy())
// 		.then(r => {
// 			console.log('DESTROY SUCCESS.');
// 			res.redirect('/admin/products');
// 		})
// 		.catch(err => console.log('ADMIN DELETE PROD ERR?', err));
// };

// exports.getProducts = (req, res, next) => {
// 	console.log('Product list for admin');
// 	// Product.fetchAll((products) => {
// 	// 	res.render('admin/products', {
// 	// 		products: products,
// 	// 		pageTitle: 'Admin Products',
// 	// 		path: '/admin/products'
// 	// 	});
// 	// });
// 	req.user.getProducts()
// 		// Product.findAll()
// 		.then(products => {
// 			res.render('admin/products', {
// 				products: products,
// 				pageTitle: 'Admin Products',
// 				path: '/admin/products'
// 			});
// 		})
// 		.catch(err => console.log('ADMIN PRODUCT LIST ERR?', err));
// };
