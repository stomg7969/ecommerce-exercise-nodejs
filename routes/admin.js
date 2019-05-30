const express = require('express');
const router = express.Router();
// now both routers can have the same url because they are differentiated by .get and .post
const adminController = require('../controllers/admin');
// admin ...
router.get("/add-product", adminController.getAddProduct);
router.get("/products", adminController.getProducts);
router.post("/add-product", adminController.postAddProduct);
router.get('/edit-product/:productId', adminController.getEditProduct);
router.post('/edit-product', adminController.postEditProduct);
router.post('/delete-product', adminController.postDeleteProduct);

module.exports = router;
// exports.routes = router;