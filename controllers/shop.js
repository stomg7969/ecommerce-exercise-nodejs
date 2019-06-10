// dotenv
const dotenv = require('dotenv');
dotenv.config();
// read files in the system for getInvoice. I do remember what this is.
const fs = require('fs');
const path = require('path');
// Automatically creates PDF file --> npm install --save pdfkit
const PDFDocument = require('pdfkit');
// Stripe payment system, npm install --save stripe
// const stripe = require('stripe')('sk_test_BMD9aaviqJzK0hlROg2KMRbD');
const stripe = require('stripe')(process.env.STRIPE_API_KEY);

const Product = require('../models/product');
const Order = require('../models/order');
// Pagination is refactored and moved to helper folder.
const { paginate } = require('../helper/pagination');

// Below can also be router.get('/products', paginate('shop/product-list', 'Products', '/products'));
exports.getProducts = (req, res, next) => paginate(req, res, next, 'shop/product-list', 'Products', '/products');
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
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};
exports.getIndex = (req, res, next) => paginate(req, res, next, 'shop/index', 'Shop', '/');
exports.getCart = (req, res, next) => {
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
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};
exports.postCart = (req, res, next) => {
	const prodId = req.body.productId;
	Product.findById(prodId)
		.then(product => {
			req.user.addToCart(product);
			res.redirect('/cart');
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};
exports.postCartDeleteProduct = (req, res) => {
	const prodId = req.body.productId;
	req.user.removeFromCart(prodId) // custom method
		.then(r => res.redirect('/cart'))
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};
exports.getCheckout = (req, res, next) => {
	// need .execPopulate to make promise to resolve, unless cb is called before .populate().
	req.user.populate('cart.items.productId').execPopulate()
		// again fetch data using .populate(). 
		.then(user => {
			const products = user.cart.items;
			let total = 0;
			products.forEach(prod => {
				total += prod.quantity * prod.productId.price;
			});
			res.render('shop/checkout', {
				pageTitle: 'Checkout',
				path: '/checkout',
				products: products,
				totalSum: total
			});
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};
exports.postOrder = (req, res, next) => {
	// Token is created using Checkout or Elements!
	// Get the payment token ID submitted by the form:
	const token = req.body.stripeToken; // Using Express && Stripe
	let totalSum = 0;
	// first, fetch product info from req.user(user model).
	req.user.populate('cart.items.productId').execPopulate()
		.then(user => {
			// this is for Stripe (section 23)
			user.cart.items.forEach(p => {
				totalSum += p.quantity * p.productId.price;
			})
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
					email: req.user.email,
					userId: req.user
				},
				products
			});
			// save.
			return order.save();
		})
		.then(r => {
			// Stripe
			const charge = stripe.charges.create({
				amount: totalSum * 100,
				currency: 'usd',
				description: 'Demo Order',
				source: token,
				metadata: { order_id: r._id.toString() } // metadata: pass arbitrary data, store id into stripe dashboard.
			})
			req.user.clearCart(); // custom method created in model.
			res.redirect('/orders');
		})
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
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
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};
exports.getInvoice = (req, res, next) => {
	const orderId = req.params.orderId;
	// Only authorize the current user to download the invoice.
	Order.findById(orderId)
		.then(order => {
			if (!order) {
				return next(new Error('No order found!'));
			}
			if (order.user.userId.toString() !== req.user._id.toString()) {
				return next(new Error('Unauthorized!'));
			}
			const invoiceName = 'invoice-' + orderId + '.pdf';
			const invoicePath = path.join('data', 'invoices', invoiceName);

			const pdfDoc = new PDFDocument();
			res.setHeader('Content-Type', 'application/pdf'); // This lets users to open 'pdf' file
			// 'inline means open pdf on the browser. attachment means download to pc.'
			res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');

			pdfDoc.pipe(fs.createWriteStream(invoicePath));
			pdfDoc.pipe(res); // res is readable and writable stream.
			pdfDoc.fontSize(25).text('Invoice', { underline: true });
			pdfDoc.text(' ');
			let totalPrice = 0;
			order.products.forEach(prod => {
				totalPrice += prod.quantity * prod.product.price;
				pdfDoc.fontSize(15).text(`${prod.product.title} - ${prod.quantity} x $${prod.product.price}`);
			});
			pdfDoc.text(' ');
			pdfDoc.text(' ');
			pdfDoc.text('Total Price: $' + totalPrice);
			pdfDoc.end();
			// fs.readFile(invoicePath, (err, data) => {
			// 	if (err) return next(err);
			// 	res.setHeader('Content-Type', 'application/pdf'); // This lets users to open 'pdf' file in the browser.
			// 	// 'inline means open pdf on the browser. attachment means download to pc.'
			// 	res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
			// 	res.send(data); // .send() provided by expressJS
			// });
			// ----------- ABOVE COMMENTED SET OF CODES IS INEFFICIENT WHEN DEALING WITH LARGE FILES. -----------
			// const file = fs.createReadStream(invoicePath); // Read data. Just stream it instead of saving to memory.
			// res.setHeader('Content-Type', 'application/pdf'); // This lets users to open 'pdf' file
			// // 'inline means open pdf on the browser. attachment means download to pc.'
			// res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
			// file.pipe(res); // .pipe() method will forward the data that is read in with the stream to res. 
		})
		.catch(err => next(err));
};