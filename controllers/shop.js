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