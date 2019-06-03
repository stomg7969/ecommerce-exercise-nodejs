const Product = require('../models/product');
const Order = require('../models/order');

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
	req.user.populate('cart.items.productId').execPopulate() // need .execPopulate to make promise to resolve, unless cb is called before .populate().
		// again fetch data using .populate(). 
		.then(user => {
			// console.log(user.cart)
			const products = user.cart.items;
			res.render('shop/cart', {
				pageTitle: 'Cart',
				path: '/cart',
				productsInCart: products
			});
		})
		.catch(err => console.log('SHOP getCart ERR?', err));
};
exports.postCart = (req, res, next) => {
	const prodId = req.body.productId;
	Product.findById(prodId)
		.then(product => {
			// req.user is saved and stored from app.js.
			req.user.addToCart(product);
			res.redirect('/cart');
		})
		.catch(err => console.log('Adding prod to cart ERR?', err));
};
exports.postCartDeleteProduct = (req, res) => {
	const prodId = req.body.productId;
	req.user.removeFromCart(prodId) // custome method
		.then(r => res.redirect('/cart'))
		.catch(err => console.log('SHOP delete CART ERR?', err));
};
exports.postOrder = (req, res) => {
	// first, fetch product info from req.user(user model).
	req.user.populate('cart.items.productId').execPopulate()
		.then(user => {
			// second, now fetched, loop through item to render not just productId, but other detail info.
			const products = user.cart.items.map(item => {
				return {
					quantity: item.quantity,
					product: { ...item.productId._doc } // _doc grab info from metadata
				}
			});
			// last, with retrieved info, create order model with them.
			const order = new Order({
				user: {
					name: req.user.name,
					userId: req.user
				},
				products
			});
			// save.
			return order.save();
		})
		.then(r => {
			req.user.clearCart(); // custom method created in model.
			res.redirect('/orders');
		})
		.catch(err => console.log('SHOP postOrder ERR?', err));
};
exports.getOrders = (req, res, next) => {
	Order.find({ 'user.userId': req.user._id })
		.then(orders => {
			res.render('shop/orders', {
				pageTitle: 'Orders',
				path: '/orders',
				orders: orders // I can always check the structure of my orders in the MongoDB Compass.
			});
		})
		.catch(err => console.log('SHOP getOrders ERR?', err));
};