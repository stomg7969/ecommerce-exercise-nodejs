const dotenv = require('dotenv');
dotenv.config();
const MONGODB_URI = `mongodb+srv://${process.env.mongoID}:${process.env.mongoPW}@cluster0-kl0m7.mongodb.net/shop?retryWrites=true&w=majority`;

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
// Session management. I can use session with cookie.
// IMPORTANT NOTE :: Cookies are accessible by any users. That is why we use session to store sensitive info.
// npm i --save express-session
const session = require('express-session');
// npm i --save connect-mongodb-session, in addition to session, to save the session into mongoDB, not memory.
const MongoDBStore = require('connect-mongodb-session')(session);
// CSURF - generates a random token every page rendered.
const csrf = require('csurf');
const csrfProtection = csrf();
// Session Flash - for error message and I know this.
// npm i --save connect-flash
const flash = require('connect-flash');

const adminRoutes = require("./routes/admin");
const shopRoutes = require('./routes/shop');
const authRouters = require('./routes/auth');
const errorController = require('./controllers/error');

const app = express();
// connect-mongodb-session management
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});

app.set('view engine', 'ejs');
// 'view engine' is part of express.js documentation.
// app.set and app.get => setter and getter
// 'pug' is templating engine that we downloaded.
app.set('views', 'views');
// first argument is like 'view engine', but the second 'views' is the directory name.

// --------- Middleware ----------
app.use(bodyParser.urlencoded({ extended: true }));
// extended can also be false
// https://stackoverflow.com/questions/29960764/what-does-extended-mean-in-express-4-0

app.use(express.static(path.join(__dirname, 'public')));
// directly forwarded to the file system.
// doesn't get handled by express. 

// Session: 
// resave -> session will not be saved on every request done.
// saveUninitialized -> also ensures no session saved for every request where doesn't need to be saved.
app.use(session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
}));
// Using csurf, .csrfToken() can be found in the req. 
app.use(csrfProtection);
// Flash MUST be called after the session.
app.use(flash());

const User = require('./models/user');
// --------------- MongoDB -----------------
// const mongoConnect = require('./helper/database').mongoConnect;

// --------------- MiddleWare -----------------
app.use((req, res, next) => {
    if (!req.session.user) return next();
    User.findById(req.session.user._id)
        .then(user => {
            if (!user) return next();
            req.user = user; // Even if the session is available, session doesn't store the object to use. 
            // So I need to store user object separately.
            next();
        })
        .catch(err => {
            throw new Error(err);
        });
});
// purpose of this middleware is to make dry code. When we pass render attributes to views.
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRouters);
// ---------------  -----------------
// 500 error page
app.get('/500', errorController.get500);
// 404 error page should be the last one.
app.use(errorController.renderError);

// ------------ MONGOOSE ------------
// IMPORTANT NOTE, mongoose is based on MongoDB, make sure I UNDERSTAND MongoDB FIRST!!!!
// ODM --> A Object-Document Mapping Library
// npm i --save mongoose
const mongoose = require('mongoose');
mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
    .then(r => {
        console.log('CONNECT SUCCESSFUL');
        app.listen(3000);
    })
    .catch(err => console.log("PROBLEM CONNECTING?", err));

// npm init ...
// npm install --save express
// npm install --save-dev nodemon
// in the package.json
    // under scripts...
    // "start": "nodemon app.js"

// *********************************************
// HERE I'LL TALK ABOUT HOW NODE.JS PROCESS WORKS WITH EXPRESS.JS

// 1. From app.js file, it will start the server.
// 2. Which ever the pages that users go to, app.js will trigger the routes.
// app.js => routes
// 3. Depending on which http request the user is triggering, the routes will lead users to that specific response in controllers.
// routes => controller
// 4-1. When there are no products, it will return empty array to prevent the site from crashing.
// 4-2. When there are products, it will read the file Content (json) using 'fs' node package. => fs.readFile()
// 5. When new product is added, it will add to json using 'fs' again. => fs.writeFile()
// controller => model => controller

// *********************************************
