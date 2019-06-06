const { validationResult } = require('express-validator/check');
const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
	// Since anyone can get access to this page without logging in by manually typing the url, I will create middleware.
	// It is in the admin router.
	res.render('admin/edit-product', {
		pageTitle: 'ADD PRODUCT',
		path: '/admin/add-product',
		editing: false,
		hasError: false,
		errorMessage: null,
		validationErrors: []
	});
};
exports.postAddProduct = (req, res) => {
	const { title, imageUrl, price, description } = req.body;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).render('admin/edit-product', {
			pageTitle: 'ADD PRODUCT',
			path: '/admin/add-product',
			editing: false,
			hasError: true,
			product: { title, imageUrl, price, description }, // For old input to refilling purpose?
			errorMessage: errors.array()[0].msg,
			validationErrors: errors.array()
		})
	}
	const product = new Product({ title, price, description, imageUrl, userId: req.user }); // Mongoose can pick up just the id from the entire req.user.
	// Above two lines are ES6 formats, originally title: title.
	product.save() // .save() is provided by Mongoose. wow.
		.then(() => {
			console.log('PRODUCT CREATED');
			res.redirect('/admin/products');
		})
		.catch((err) => {
			res.redirect('/500'); // Better to debug a bigger problems instead of letting the app crash.
		});
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
				product: product,
				hasError: false,
				errorMessage: null,
				validationErrors: []
			});
			// Remember, res.render is what I send information to view pages.
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};
exports.postEditProduct = (req, res, next) => {
	// updated information
	const { productId, title, price, imageUrl, description } = req.body;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).render('admin/edit-product', {
			pageTitle: 'EDIT PRODUCT',
			path: '/admin/edit-product',
			editing: true,
			hasError: true,
			product: { _id: productId, title, imageUrl, price, description }, // For old input to refilling purpose?
			errorMessage: errors.array()[0].msg,
			validationErrors: errors.array()
		})
	}
	// const product = new Product(title, price, description, imageUrl, productId);
	// In Mongoose, I don't need to update with new instance, I can find the product by id, update, then save.
	Product.findById(productId)
		.then(product => {
			if (product.userId.toString() !== req.user._id.toString()) return res.redirect('/');
			product.title = title;
			product.price = price;
			product.description = description;
			product.imageUrl = imageUrl;
			return product.save()
				.then(r => {
					console.log('Product Updated SUCCESS!');
					res.redirect('/admin/products');
				})
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};
exports.postDeleteProduct = (req, res) => {
	const { productId, productPrice } = req.body;
	// ------------- SEQUELIZE ---------------
	// what about price?
	// Product.findByIdAndRemove(productId)
	Product.deleteOne({ _id: productId, userId: req.user._id })
		.then(r => {
			console.log('DESTROY SUCCESS.');
			res.redirect('/admin/products');
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};
exports.getProducts = (req, res, next) => {
	Product.find({ userId: req.user._id })
		// .select('title price -_id') // I can select which info to include and exclude. '-' will exclude from rendering.
		// Mongoose utility method, this tells mongoose to populate a certain field with all detail info, not just id.
		// .populate('userId', 'name') // it takes path as an argument. I defined it as userId, it could have been 'beefId'.
		// The second argument will specifically tell .populate() to render what detail info and exclude the rest. Otherwise, render all info.
		.then((products) => {
			res.render('admin/products', {
				products: products,
				pageTitle: 'Admin Products',
				path: '/admin/products'
			});
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};
