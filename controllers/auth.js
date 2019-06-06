const dotenv = require('dotenv');
dotenv.config();
// Download bcryptjs for reason I already know.
// npm i --save bcryptjs 
const bcrypt = require('bcryptjs');
// Nodejs's default library, crypto ==> for resetting password.
const crypto = require('crypto');
// Validator: check auth routes file for details
// validationResult gathers all errors
const { validationResult } = require('express-validator/check');
// Sending email to users nodemailer with sendgrid
// npm i --save nodemailer nodemailer-sendgrid-transport
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SENDGRID_API_KEY
    }
  })
);
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL,
//     pass: process.env.GMAILPW
//   }
// })
const User = require('../models/user');

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  message.length > 0 ? message = message[0] : message = null;

  res.render('auth/login', {
    pageTitle: 'Login',
    path: '/login',
    errorMessage: message
  });
};
exports.getSignup = (req, res) => {
  // let message = req.flash('error');
  let message = ''; // Since I am using express-validator, I don't need flash, but good to have it just in case;
  message.length > 0 ? message = message[0] : message = null;

  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message
  });
};
exports.postLogin = (req, res, next) => {
  // res.setHeader('Set-Cookie', 'loggedIn=true; HttpOnly'); // LIke localStorage.setItem / removeItem. I can set multiple cookies with ';'
  // I can check the cookie in Chrome -> Application -> Cookies -> <the URL I am using>.
  // I can grab that cookie if I want  ==> console.log(req.get('Cookie').split('=')[1]);
  // IMPORTANT: Cookies can be MANIPULATED by Users from their Browser. So store only NOT important ones like cart items.
  // req.isLoggedIn = true; // this data is lost after the request, like state in react. // That is where cookies or session come in.

  // -------------- session ----------------
  // req.session.isLoggedIn = true;
  // I use npm i --save connect-mongodb-session to save session in MongoDB.
  // Otherwise, session is saved in memory which will be a problem if I have thousands of users.

  // User.findById('5cf56c93e59d2b1978fa71cc')
  //   // this method used to be in app.js as middleware, but now it's here because I want to authenticate user ONLY WHEN they are logged in.
  //   .then(user => {
  //     req.session.isLoggedIn = true;
  //     req.session.user = user;
  //     // saving to session takes couple millie seconds. So I moved redirect to .then. 
  //     // another possible way is doing ...session.save(), 
  //     // req.session.save((err) => {
  //     //   console.log(err);
  //     //   res.redirect('/');
  //     // })
  //   })
  // -------------- Now I'm not using dummy user Id --------------
  const { email, password } = req.body;
  User.findOne({ email })
    .then(userData => {
      if (!userData) {
        req.flash('error', 'Invalid Email or Password.');
        return res.redirect('/login')
      };
      bcrypt.compare(password, userData.password) // .compare() compares bcrypted pw with input pw. Returns a promise!!!
        .then(confirmed => {
          if (confirmed) {
            req.session.isLoggedIn = true;
            req.session.user = userData;
            return req.session.save(err => {
              console.log(err);
              res.redirect('/');
            });
          }
          req.flash('error', 'Invalid Email or Password.');
          res.redirect('/login');
        })
        .catch(err => console.log('Auth postLogin Err(inner)?', err));
    })
    .catch(err => console.log("Auth postLogin ERR?", err));
};
exports.postSignup = (req, res, next) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  // errors will show which one is problematic. it shows location, param, value, err msg
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: errors.array()[0].msg
    });
  }
  bcrypt.hash(password, 12)
    .then(hashPW => {
      const user = new User({
        email,
        password: hashPW,
        cart: { items: [] }
      });
      return user.save();
    })
    .then(r => {
      res.redirect('/login'); // .sendMail returns promise, but I don't have to wait because it's just sending email.
      return transporter.sendMail({ // sendGrid sending email API.
        to: email,
        from: `Me <${process.env.EMAIL}>`,
        subject: 'Signup Succeeded!',
        html: '<h1>You successfully signed up!</h1>'
      });
    })
    .catch(err => console.log('SENDGRID ERR?', err));
};
exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log('ERR Logging out?', err);
    res.redirect('/');
  });
};
// Resetting password, must have working sendgrid.
exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  message.length > 0 ? message = message[0] : message = null;

  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset PW',
    errorMessage: message
  })
};
exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => { // generating random token. by using .randomBytes.
    if (err) {
      console.log('Password resetting failed. =>', err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex'); // Generate token here.
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          req.flash('error', 'No Account with that email found.');
          return res.redirect('/reset');
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000; // expire token in an hour.
        user.save()
          .then(r => {
            res.redirect('/');
            transporter.sendMail({
              to: req.body.email,
              from: process.env.EMAIL,
              subject: 'Password Reset',
              html: `
                <p>You requested a password reset</p>
                <p>Click this <a href="http://localhost:3000/reset/${token}">Link</a> to set a new password.</p>
              `
            });
          })
      })
      .catch(err => console.log('Auth postReset ERR', err));
  });
};
exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } }) // $gt means greater than.
    .then(user => {
      let message = req.flash('error');
      message.length > 0 ? message = message[0] : message = null;

      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token
      });
    })
    .catch(err => console.log('Auth, getNewPassword', err));
};
exports.postNewPassword = (req, res, next) => {
  const { password, userId, passwordToken } = req.body;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId
  })
    .then(user => {
      resetUser = user;
      return bcrypt.hash(password, 12)
    })
    .then(hashed => {
      resetUser.password = hashed;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(r => res.redirect('/login'))
    .catch(err => console.log('Auth postNewPassword', err));
};
exports.getUpdatePassword = (req, res) => {
  let message = req.flash('error');
  message.length > 0 ? message = message[0] : message = null;

  res.render('auth/update-password', {
    path: '/update-password',
    pageTitle: 'Update Password',
    errorMessage: message
  });
};
// change PW while logged in
exports.postUpdatePassword = (req, res) => {
  const { password, newPassword, confirmPassword } = req.body;
  if (newPassword !== confirmPassword) { // I can also validate this in the routes file. (see postSignup).
    req.flash('error', 'Confirm password again');
    return res.redirect('/update-password');
  }
  User.findOne({ _id: req.user._id })
    .then(userData => {
      bcrypt.compare(password, userData.password)
        .then(confirmed => {
          if (confirmed) {
            bcrypt.hash(newPassword, 12)
              .then(hashed => {
                userData.password = hashed;
                return userData.save();
              })
              .then(r => {
                res.redirect('/');
              })
          } else {
            req.flash('error', 'Incorrect Password');
            res.redirect('/update-password');
          }
        })
    })
    .catch(err => {
      req.flash('error', 'Something wrong with user info, try again');
      res.redirect('/update-password');
    })
};

// I can use Cookie and Session together. 
// I store more sensitive info in session, then I can associate with Cookie. Encrypted.

// ------------- Cookies -------------
// => Great for storing data on the client (browser).
// => Do NOT store sensitive data here! It can be viewed + manipulated. 
// => Cookies can be configured to expire when the browser is closed(-> "Session Cookie") 
// ... or when a certain age/expiry data is reached ("Permanent Cookie").
// => Works well together with Sessions.

// ------------- Sessions -------------
// => Stored on the server, NOT on the client.
// => Great for storing sensitive data that should survive across requests.
// => You can store ANYTHING in sessions.
// => Often used for storing user data/authentication status.
// => Identified via Cookie (don't mistake this with the term "Session Cookie").
// => You can use different storages for saving your sessions on the server (like MongoDB and SQL).