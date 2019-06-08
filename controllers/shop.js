// read files in the system for getInvoice. I do remember what this is.
const fs = require('fs');
const path = require('path');
// Automatically creates PDF file --> npm install --save pdfkit
const PDFDocument = require('pdfkit');

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
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
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
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
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
		.catch(err => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};
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
					email: req.user.email,
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