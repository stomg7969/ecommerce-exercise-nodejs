const User = require('../models/user');

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    pageTitle: 'Login',
    path: '/login',
    isAuthenticated: false
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
  User.findById('5cf56c93e59d2b1978fa71cc')
    // this method used to be in app.js as middleware, but now it's here because I want to authenticate user ONLY WHEN they are logged in.
    .then(user => {
      req.session.isLoggedIn = true;
      req.session.user = user;
      res.redirect('/');
    })
    .catch(err => console.log("Auth postLogin ERR?", err));
};
exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log('ERR Logging out?', err);
    res.redirect('/');
  });
};

// I can use Cookie and Session together. 
// I store more sensitive info in session, then I can associate with Cookie. Encrypted.