const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
	res.render('admin/edit-product', {
		pageTitle: 'ADD PRODUCT',
		path: '/admin/add-product',
		editing: false
	});
};
exports.postAddProduct = (req, res) => {
	const { title, imageUrl, price, description } = req.body;
	const product = new Product({ title, price, description, imageUrl }); // this is ES6 format, originally title: title.
	product.save() // .save() is provided by Mongoose. wow.
		.then(() => {
			console.log('PRODUCT CREATED');
			res.redirect('/');
		})
		.catch((err) => console.log('HAS ERR IN ADMIN CTRL?', err));
};
exports.getEditProduct = (req, res, next) => {
	// .query is for checking query params in the url.
	// so this path will work only when url has .../:id?edit=true
	const editMode = req.query.edit;
	console.log("DOES QUERY URL HAS '?edit=true'?", editMode);
	if (!editMode) return res.redirect('/');

	const prodId = req.params.productId;
	Product.findById(prodId)
		.then(product => {
			if (!product) return res.redirect('/');
			res.render('admin/edit-product', {
				pageTitle: 'Edit PRODUCT',
				path: '/admin/edit-product',
				editing: editMode,
				product: product
			});
			// Remember, res.render is what I send information to view pages.
		})
		.catch(err => {
			console.log('ADMIN EDIT PRD ERR?', err);
		})
};
exports.postEditProduct = (req, res, next) => {
	// updated information
	const { productId, title, price, imageUrl, description } = req.body;
	// const product = new Product(title, price, description, imageUrl, productId);
	// In Mongoose, I don't need to update with new instance, I can find the product by id, update, then save.
	Product.findById(productId)
		.then(product => {
			product.title = title;
			product.price = price;
			product.description = description;
			product.imageUrl = imageUrl;
			return product.save();
		})
		.then(r => {
			console.log('Product Updated SUCCESS!');
			res.redirect('/admin/products');
		})
		.catch(err => console.log('ADMIN postEdit ERR?', err));
};
exports.postDeleteProduct = (req, res) => {
	const { productId, productPrice } = req.body;
	// ------------- SEQUELIZE ---------------
	// what about price?
	Product.findByIdAndRemove(productId)
		.then(r => {
			console.log('DESTROY SUCCESS.');
			res.redirect('/admin/products');
		})
		.catch(err => console.log('ADMIN DELETE PROD ERR?', err));
};
exports.getProducts = (req, res, next) => {
	Product.find()
		.then((products) => {
			res.render('admin/products', {
				products: products,
				pageTitle: 'Admin Products',
				path: '/admin/products'
			});
		})
		.catch(err => console.log('admin getProducts ERR?', err));
};
