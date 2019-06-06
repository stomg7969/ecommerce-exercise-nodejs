const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
// isAuth checks if user is authorized to have an access.
const isAuth = require('../middleware/is-auth');

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

router.post('/logout', authController.postLogout);

router.get('/signup', authController.getSignup);
router.post('/signup', authController.postSignup);

router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);

router.get('/update-password', isAuth, authController.getUpdatePassword)
router.post('/update-password', authController.postUpdatePassword)

module.exports = router;