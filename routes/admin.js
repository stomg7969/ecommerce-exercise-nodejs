const express = require('express');
// now both routers can have the same url because they are differentiated by .get and .post
const router = express.Router();
// Validating user input in the backend. Not doing this in frontend because users can manipulate it by disabling javascript. 
// npm i --save express-validator
const { body } = require('express-validator/check');
const adminController = require('../controllers/admin');
// isAuth checks if user is authorized to have an access.
const isAuth = require('../middleware/is-auth');
// admin ...
// router.get() executes arguments from LEFT to RIGHT. So I can put as many args as I want.
router.get("/products", isAuth, adminController.getProducts);

router.get("/add-product", isAuth, adminController.getAddProduct);
router.post(
  "/add-product",
  [
    body('title')
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body('price').isFloat(),
    body('description')
      .isLength({ min: 1, max: 400 })
      .trim()
  ],
  adminController.postAddProduct
);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);
router.post(
  '/edit-product',
  [
    body('title')
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body('price').isFloat(),
    body('description')
      .isLength({ min: 1, max: 400 })
      .trim()
  ],
  adminController.postEditProduct
);

router.post('/delete-product', adminController.postDeleteProduct);

module.exports = router;
// exports.routes = router;