const express = require('express');
const router = express.Router();
// Validating user input in the backend. Not doing this in frontend because users can manipulate it by disabling javascript. 
// npm i --save express-validator
const { check, body } = require('express-validator/check');
const authController = require('../controllers/auth');
const User = require('../models/user');
// isAuth checks if user is authorized to have an access.
const isAuth = require('../middleware/is-auth');

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

router.post('/logout', authController.postLogout);

router.get('/signup', authController.getSignup);
// Finds parameter called email (passed from frontend(view)). checks if its in email form.
// I can customize error message .withMessage().
router.post(
  '/signup',
  [
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .custom((value, { req }) => {
        return User.findOne({ email: value })
          .then(userData => {
            if (userData) {
              return Promise.reject('Email exists.'); // Built-in javascript object: throw an error inside of the promise. Reject with message.
            }
            return true; // Still works without this.
          });
      })
      .normalizeEmail(), // deletes any white spaces and .toLowerCase(). Literally normalizes user input.
    // body() checks 'password' value only in the body. ==> SANITIZING
    body('password', 'The 2nd arg here becomes the default error message.') // I don't have to .withMessage() after every call method.
      .isLength({ min: 5, max: 25 })
      .isAlphanumeric()
      .trim(), // trims white space. ==> It's called SANITIZING. 
    body('confirmPassword')
      .trim() // SANITIZING
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords have to match');
        }
        return true;
      })
  ],
  authController.postSignup
);

router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);

router.get('/update-password', isAuth, authController.getUpdatePassword)
router.post(
  '/update-password',
  [
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('New passwords is not confirmed.');
      }
      return true;
    })
  ],
  authController.postUpdatePassword
)

module.exports = router;