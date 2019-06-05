const express = require('express');
const router = express.Router();
// now both routers can have the same url because they are differentiated by .get and .post
const adminController = require('../controllers/admin');
// isAuth checks if user is authorized to have an access.
const isAuth = require('../middleware/is-auth');
// admin ...
// router.get() executes arguments from LEFT to RIGHT. So I can put as many args as I want.
router.get("/add-product", isAuth, adminController.getAddProduct);
router.get("/products", isAuth, adminController.getProducts);
router.post("/add-product", adminController.postAddProduct);
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);
router.post('/edit-product', adminController.postEditProduct);
router.post('/delete-product', adminController.postDeleteProduct);

module.exports = router;
// exports.routes = router;