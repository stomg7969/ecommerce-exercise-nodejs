// const path = require("path");
// const rootDir = require("../helper/path");
const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
	Product.findAll()
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
	// ------------------ SEQUELIZE I -------------------
	Product.findByPk(prodId)
		.then(product => {
			res.render('shop/product-detail', {
				product: product,
				pageTitle: product.title,
				path: '/products'
			})
		})
		.catch((err) => console.log('HAS ERR IN getProduct?', err));
	// ------------------ SEQUELIZE II -------------------
	// When you want to get very specific attributes.
	// if I use where, it will return array, so I will need the first idx of it.
	// Product.findAll({ where: { id: prodId } })
	// 	.then(products => {
	// 		res.render('shop/product-detail', {
	// 			product: products[0],
	// 			pageTitle: products[0].title,
	// 			path: '/products'
	// 		});
	// 	})
	// 	.catch(err => console.log(err));
};
exports.getIndex = (req, res, next) => {
	// // Remember that the data is stored in first element. Instructor calls it rows.
	// Product.fetchAll()
	// 	// fieldData can be deleted, but let it be there so I don't forget.
	// 	.then(([rows, fieldData]) => {
	// 		res.render('shop/index', {
	// 			products: rows,
	// 			pageTitle: 'Shop',
	// 			path: '/'
	// 		});
	// 	})
	// 	.catch((err) => console.log('HAS ERR IN getIndex?', err));
	// ------------------- SEQUELIZE ------------------------
	Product.findAll()
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
	// Here, I am rendering list of products that is in the cart.json.
	// But I also have to fetch from products because cart.json doesn't contain detail product info.
	// So I will get products that overlap, and modify product structure to fit to cart page.
	// Cart.getCart((cart) => {
	// 	Product.fetchAll((products) => {
	// 		// by creating empty array, there won't be an error even if cart is empty.
	// 		const cartProducts = [];
	// 		for (const product of products) {
	// 			const cartProductObj = cart.products.find((prod) => prod.id === product.id);
	// 			if (cartProductObj) {
	// 				cartProducts.push({ product, qty: cartProductObj.qty });
	// 			}
	// 		}
	// 		res.render('shop/cart', {
	// 			pageTitle: 'Cart',
	// 			path: '/cart',
	// 			products: cartProducts
	// 		});
	// 	});
	// });
	// ------------ SEQUELIZE ------------
	req.user.getCart()
		.then(cart => {
			return cart.getProducts()
				.then(products => {
					res.render('shop/cart', {
						pageTitle: 'Cart',
						path: '/cart',
						products: products
					});
				})
				.catch(err => console.log('SHOP getCart ERR?', err));
		})
		.catch(err => console.log('SHOP getCart 2nd ERR?', err));
};
exports.postCart = (req, res, next) => {
	const prodId = req.body.productId;
	// Product.findById(prodId, (product) => {
	// 	Cart.addProduct(prodId, product.price);
	// });
	// res.redirect('/cart');
	// ------------ SEQUELIZE ------------
	let fetchedCart; // to store product into cart.
	let newQty = 1;
	// first, need to get cart that belongs to user.
	req.user.getCart()
		.then(cart => {
			fetchedCart = cart;
			return cart.getProducts({ where: { id: prodId } });
		}) // get products that are in the cart.
		.then(products => {
			// In the cart, there might be no products.
			let product;
			if (products.length > 0) {
				product = products[0];
			}
			if (product) {
				const oldQty = product.cartItem.quantity;
				newQty = oldQty + 1;
				return product;
			}
			return Product.findByPk(prodId)
		}) // If there are products in cart, update Qty, then return it, otherwise, return the 'clicked by user' product
		.then(product => {
			// addProduct() is method added by sequelize
			return fetchedCart.addProduct(product, {
				through: { quantity: newQty }
			});
		}) // then, add it to cart, through cart item.
		.then(() => res.redirect('/cart'))
		.catch(err => console.log('SHOP postCart Err?', err));
};
exports.postCartDeleteProduct = (req, res) => {
	// Again, like delete product, I can use hidden input for price then pass it.
	// ... here, I will just follow along with instruction.
	const prodId = req.body.productId;
	// findById is static custom function.
	// Product.findById(prodId, (product) => {
	// 	Cart.deleteProduct(prodId, product.price);
	// 	res.redirect('/cart');
	// });
	// ------------ SEQUELIZE ------------
	req.user.getCart()
		.then(cart => cart.getProducts({ where: { id: prodId } }))
		.then(products => {
			const product = products[0];
			return product.cartItem.destroy();
		})
		.then(r => res.redirect('/cart'))
		.catch(err => console.log('SHOP delete CART ERR?', err));
};
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