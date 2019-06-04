exports.getLogin = (req, res, next) => {
  const isLoggedIn = req.get('Cookie').split('=')[1]; // Be aware that there might be MULTIPLE COOKIES.
  res.render('auth/login', {
    pageTitle: 'Login',
    path: '/login',
    isAuthenticated: req.isLoggedIn
  });
};
exports.postLogin = (req, res, next) => {
  res.setHeader('Set-Cookie', 'loggedIn=true') // LIke localStorage.setItem / removeItem.
  // I can check the cookie in Chrome -> Application -> Cookies -> <the URL I am using>.
  // I can grab that cookie if I want  ==> console.log(req.get('Cookie').split('=')[1]);
  // IMPORTANT: Cookies can be MANIPULATED by Users from their Browser. So store only NOT important ones like cart items.
  // req.isLoggedIn = true; // this data is lost after the request, like state in react. // That is where cookies or session come in.
  res.redirect('/');
};