const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
	Product.find() // static method given in the Mongoose documentation. Returns array
		// IMPORTANT NOTE: If my data is large, then instead of fetching all products, use .curse().next(), or limit the data retrieved.
		.then(products => {
			res.render('shop/product-list', {
				products: products,
				pageTitle: 'All Products',
				path: '/products'
			});
		})
		.catch(err => console.log('HAS ERR IN getIndex shop.js?', err));
};
exports.getProduct = (req, res, next) => {
	const prodId = req.params.productId;
	Product.findById(prodId) // Mongoose already had findById, so we don't need to define it. So nice.
		.then(product => {
			res.render('shop/product-detail', {
				product: product,
				pageTitle: product.title,
				path: '/products'
			})
		})
		.catch((err) => console.log('HAS ERR IN getProduct?', err));
};
exports.getIndex = (req, res, next) => {
	Product.find()
		.then(products => {
			res.render('shop/index', {
				products: products,
				pageTitle: 'Shop',
				path: '/'
			});
		})
		.catch(err => console.log('HAS ERR IN getIndex shop.js?', err));
};
exports.getCart = (req, res, next) => {
	// I can call req.user because this is where I stored user object when first created.
	req.user.getCart()
		.then(products => {
			res.render('shop/cart', {
				pageTitle: 'Cart',
				path: '/cart',
				products: products
			});
		})
		.catch(err => console.log('SHOP getCart ERR?', err));
};
exports.postCart = (req, res, next) => {
	const prodId = req.body.productId;
	// ------------ MONGODB ------------
	Product.findById(prodId)
		.then(product => {
			req.user.addToCart(product);
			res.redirect('/cart');
		})
		.catch(err => console.log('Adding prod to cart ERR?', err));
};
exports.postCartDeleteProduct = (req, res) => {
	const prodId = req.body.productId;
	req.user.deleteItemFromCart(prodId)
		.then(r => res.redirect('/cart'))
		.catch(err => console.log('SHOP delete CART ERR?', err));
};
exports.postOrder = (req, res) => {
	req.user.addOrder()
		.then(r => res.redirect('/orders'))
		.catch(err => console.log('SHOP postOrder ERR?', err));
};
exports.getOrders = (req, res, next) => {
	req.user.getOrders()
		.then(orders => {
			res.render('shop/orders', {
				pageTitle: 'Orders',
				path: '/orders',
				orders: orders
			});
		})
		.catch(err => console.log('SHOP getOrders ERR?', err));
};