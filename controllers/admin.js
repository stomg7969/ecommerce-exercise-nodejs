const { validationResult } = require('express-validator/check');
const Product = require('../models/product');
const fileHelper = require('../helper/file');

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
	// imageUrl is deleted from body and grab it from req.file.image because it makes sense for users to upload images than copy-pasting url.
	const { title, price, description } = req.body;
	const image = req.file;
	if (!image) {
		return res.status(422).render('admin/edit-product', {
			pageTitle: 'ADD PRODUCT',
			path: '/admin/add-product',
			editing: false,
			hasError: true,
			product: { title, price, description }, // For old input to refilling purpose?
			errorMessage: 'Attached file is not an image',
			validationErrors: []
		})
	}
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).render('admin/edit-product', {
			pageTitle: 'ADD PRODUCT',
			path: '/admin/add-product',
			editing: false,
			hasError: true,
			product: { title, price, description }, // For old input to refilling purpose?
			errorMessage: errors.array()[0].msg,
			validationErrors: errors.array()
		})
	}
	const imageUrl = image.path; // Because I don't want to save file into db, I will only save path to the file in the db.
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
	const { productId, title, price, description } = req.body;
	const image = req.file;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).render('admin/edit-product', {
			pageTitle: 'EDIT PRODUCT',
			path: '/admin/edit-product',
			editing: true,
			hasError: true,
			product: { _id: productId, title, price, description }, // For old input to refilling purpose?
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
			if (image) {
				// fileHelper is imported from helper folder
				fileHelper.deleteFile(product.imageUrl); // This is promise, but we don't wait because we don't care about the result.
				product.imageUrl = image.path;
			}
			return product.save()
				.then(r => {
					console.log('Product Updated SUCCESS!');
					res.redirect('/admin/products');
				})
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error); // If I call next() with error as an argument, it will call 500 error middleware in app.js
		});
};
exports.deleteProduct = (req, res) => {
	// UPDATING PRODUCT PRICE IS SOMETHING I HAVE TO DO ON MY OWN.
	// const { productId, productPrice } = req.body;
	const { productId } = req.params;
	Product.findById(productId)
		.then(product => {
			if (!product) {
				return next(new Error('Product not found!'))
			};
			// fileHelper is imported from helper folder
			fileHelper.deleteFile(product.imageUrl); // This is promise, but we don't wait because we don't care about the result.
			// Product.findByIdAndRemove(productId)
			return Product.deleteOne({ _id: productId, userId: req.user._id })
		})
		.then(r => {
			console.log('DESTROY SUCCESS.');
			// res.redirect('/admin/products'); No more redirecting to re-render the page. 
			// argument in json() is NOT optional. Client side fetch needs something in return. This arg is the something. 
			res.status(200).json({ message: 'Delete Success' });
		})
		.catch(err => {
			res.status(500).json({ message: "Deleting failed: 500" });
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
