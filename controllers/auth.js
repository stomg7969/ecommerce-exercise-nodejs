const dotenv = require('dotenv');
dotenv.config();
// Download bcryptjs for reason I already know.
// npm i --save bcryptjs 
const bcrypt = require('bcryptjs');
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
  let message = req.flash('error');
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
  const { email, password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    req.flash('error', 'Passwords do not match');
    res.redirect('/signup');
  }
  User.findOne({ email })
    .then(userData => {
      if (userData) {
        req.flash('error', 'Email already exists');
        return res.redirect('/signup');
      }
      return bcrypt.hash(password, 12)
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
    })
    .catch(err => console.log('ERR fetching email in Auth postSignup?', err));
};
exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log('ERR Logging out?', err);
    res.redirect('/');
  });
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