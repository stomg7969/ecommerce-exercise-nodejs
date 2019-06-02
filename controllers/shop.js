// const path = require("path");
// const rootDir = require("../helper/path");
const Product = require('../models/product');
// We don't need to import Order and Cart from model anymore because we are using association.
// Getting everything from user.

exports.getProducts = (req, res, next) => {
	Product.fetchAll()
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
	// Product.findById(prodId)
	// 	//  Reason for [product] is ... it's like const { value } = req.body;
	// 	.then(([product]) => {
	// 		res.render('shop/product-detail', {
	// 			// [product] will return the first element only, but in array. So I need to get the first index.
	// 			product: product[0],
	// 			pageTitle: product.title,
	// 			path: '/products'
	// 		});
	// 	})
	Product.findById(prodId)
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
	Product.fetchAll()
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
	let fetchedCart; // to clear the cart, I will store the items into here so I don't lose.
	req.user.getCart() // .getCart() grants me an access to that user's cart.
		.then(cart => {
			fetchedCart = cart;
			return cart.getProducts();
		}) // .getProducts() grants me an access to all products in the cart.
		.then(products => {
			return req.user.createOrder() // User creates an order, but the orders needs items in there.
				.then(order => {
					// In order, I insert all products that are in the cart.
					// I can't just do, order.addProducts(products, {through: {quantity}});, because quantities are different.
					return order.addProducts(
						// So get show different quantity, I used .map().
						products.map(product => {
							product.orderItem = { quantity: product.cartItem.quantity };
							return product;
						})
					);
				})
				.catch(err => console.log('SHOP nested postOrder ERR?', err));
		})
		.then(r => fetchedCart.setProducts(null))
		.then(r => res.redirect('/orders'))
		.catch(err => console.log('SHOP postOrder ERR?', err));
};
exports.getOrders = (req, res, next) => {
	req.user.getOrders({ include: ['products'] })
		// problem in the orders.ejs is that orders.orderItem can't be looped because ...
		// ... in the app.js, I associated, Order.belongsToMany(Product). NOT products, it's product.
		// sequelize automatically pluralize this. We can't manually write products because Product object is one object.
		// So it does not structure it iterable, unless we explicitly tell it to.
		// So I need {include: ['products']} in the req.user.getOrders()
		// Now, instead of looping order.orderItem, --> I can do, order.products.forEach...
		// To reach orderItem, I can grab it from the 'products'. 
		// Conclusion: order --> products --> orderItem.
		.then(orders => {
			res.render('shop/orders', {
				pageTitle: 'Orders',
				path: '/orders',
				orders: orders
			});
		})
		.catch(err => console.log('SHOP getOrders ERR?', err));
};