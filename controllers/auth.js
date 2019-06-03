exports.getLogin = (req, res, next) => {
  console.log(req.get('Cookie').split('=')[1]);
  // const isLoggedIn = req.get('Cookie').split(';')[1].split('=')[1];
  res.render('auth/login', {
    pageTitle: 'Login',
    path: '/login',
    isAuthenticated: req.isLoggedIn
  });
};
exports.postLogin = (req, res, next) => {
  res.setHeader('Set-Cookie', 'loggedIn=true') // LIke localStorage.setItem / removeItem.
  // I can check the cookie in Chrome -> Application -> Cookies -> <the URL I am using>.
  // I can grab that cookie if I want  ==> console.log(req.get('Cookie').split(';')[1].split('=')[1]);
  // req.isLoggedIn = true; // this data is lost after the request, like state in react. // That is where cookies or session come in.
  res.redirect('/');
};