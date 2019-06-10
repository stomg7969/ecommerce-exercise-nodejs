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
// Multer read uploaded files (binary data) and parses it.
const multer = require('multer');
// Receive multer file, and diskStorage configuration will tell it how to handle the file.
const fileStorage = multer.diskStorage({
    // first argument in cb is error. Null means store it anyway.
    destination: (req, file, cb) => cb(null, 'images'),
    // second argument in cb is to make unique file name.
    filename: (req, file, cb) => cb(null, new Date().toISOString() + '-' + file.originalname)
});
// Will filter and validate files before accepting.
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/gif') {
        cb(null, true); // accept file.
    } else {
        cb(null, false);
    }
}

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
// Changes the 'body' into text for node to understand. 
// extended can also be false
// https://stackoverflow.com/questions/29960764/what-does-extended-mean-in-express-4-0
app.use(bodyParser.urlencoded({ extended: false }));
// bodyParser doesn't know how to read uploaded file because uploaded files are binary data.
// So we use Multer --> parses incoming requests for files. IT IS A MIDDLEWARE. 
// npm install --save multer
app.use(multer({ storage: fileStorage, fileFilter }).single('image'));
// statically serving public folder as middleware. Meaning that requests to file in the folder will be handled automatically at the files will be returned.
// If causes an error, always check the route first if images folder is located where middleware thinks it is.
// ... As a solution, just add / in front of product imageUrl to make it absolute path.
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// Session: 
// resave -> session will not be saved on every request done.
// saveUninitialized -> also ensures no session saved for every request where doesn't need to be saved.
app.use(session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
}));

// Flash MUST be called after the session.
app.use(flash());

const User = require('./models/user');
// --------------- MongoDB -----------------
// const mongoConnect = require('./helper/database').mongoConnect;

// purpose of this middleware is to make dry code. When we pass render attributes to views.
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    next();
});
// --------------- MiddleWare -----------------
app.use((req, res, next) => {
    // IMPORTANT NOTE: Outside of the promise is synchronous. So when there is an error, .catch()/express can detect the error.
    // ... however, if it's inside the .then(), which is promise, asynchronous, .catch()/express will not detect the error.
    if (!req.session.user) return next();
    User.findById(req.session.user._id)
        .then(user => {
            if (!user) return next();
            req.user = user; // Even if the session is available, session doesn't store the object to use. 
            // So I need to store user object separately.
            next();
        })
        .catch(err => {
            next(new Error(err));
        });
});
const shopController = require('./controllers/shop');
// isAuth checks if user is authorized to have an access.
const isAuth = require('./middleware/is-auth');
// Payment feature with Stripe

app.post('/create-order', isAuth, shopController.postOrder);

// Using csurf, .csrfToken() can be found in the req. 
app.use(csrfProtection); // below checkout because it's external application, csrf won't work.
app.use((req, res, next) => {
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
// Error handling middleware.
app.use((error, req, res, next) => {
    // res.redirect('/500');
    // res.render('/500');
    res.status(500).render("500", {
        pageTitle: 'Error 500',
        path: '500',
        isAuthenticated: req.session.isLoggedIn
    });
});

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
