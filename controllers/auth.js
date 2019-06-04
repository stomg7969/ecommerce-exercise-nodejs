exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    pageTitle: 'Login',
    path: '/login',
    isAuthenticated: req.isLoggedIn
  });
};
exports.postLogin = (req, res, next) => {
  // res.setHeader('Set-Cookie', 'loggedIn=true; HttpOnly'); // LIke localStorage.setItem / removeItem. I can set multiple cookies with ';'
  // I can check the cookie in Chrome -> Application -> Cookies -> <the URL I am using>.
  // I can grab that cookie if I want  ==> console.log(req.get('Cookie').split('=')[1]);
  // IMPORTANT: Cookies can be MANIPULATED by Users from their Browser. So store only NOT important ones like cart items.
  // req.isLoggedIn = true; // this data is lost after the request, like state in react. // That is where cookies or session come in.

  // -------------- session ----------------
  req.session.isLoggedIn = true;
  // I use npm i --save connect-mongodb-session to save session in MongoDB.
  // Otherwise, session is saved in memory which will be a problem if I have thousands of users.

  res.redirect('/');
};

// I can use Cookie and Session together. 
// I store more sensitive info in session, then I can associate with Cookie. Encrypted.