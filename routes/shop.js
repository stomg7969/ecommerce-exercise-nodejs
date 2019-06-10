const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shop');
// isAuth checks if user is authorized to have an access.
const isAuth = require('../middleware/is-auth');

// router.use("/", (req, res, next) => {
// .use, .get does not matter.
// but if I use .get instead of .use, it means route is exact match.
router.get("/", shopController.getIndex);

router.get("/products", shopController.getProducts);
router.get("/products/:productId", shopController.getProduct);

router.get("/cart", isAuth, shopController.getCart);
router.post("/cart", shopController.postCart);
router.post('/cart-delete-item', shopController.postCartDeleteProduct);

router.get("/orders", isAuth, shopController.getOrders);

router.get('/checkout', isAuth, shopController.getCheckout);
// For users to download order invoices
router.get('/orders/:orderId', isAuth, shopController.getInvoice);

module.exports = router;