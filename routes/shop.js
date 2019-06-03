const express = require('express');
const router = express.Router();

const shopController = require('../controllers/shop');

// router.use("/", (req, res, next) => {
// .use, .get does not matter.
// but if I use .get instead of .use, it means route is exact match.
router.get("/", shopController.getIndex);
router.get("/products", shopController.getProducts);
router.get("/products/:productId", shopController.getProduct);
router.get("/cart", shopController.getCart);
router.post("/cart", shopController.postCart);
router.post('/cart-delete-item', shopController.postCartDeleteProduct);
router.post('/create-order', shopController.postOrder);
router.get("/orders", shopController.getOrders);

module.exports = router;