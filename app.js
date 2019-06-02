// const http = require('http');
// const routes = require('./routes');
// const myRoute = require('./route-exercise');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const adminRoutes = require("./routes/admin");
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/error');

const app = express();

app.set('view engine', 'ejs');
// 'view engine' is part of express.js documentation.
// app.set and app.get => setter and getter
// 'pug' is templating engine that we downloaded.
app.set('views', 'views');
// first argument is like 'view engine', but the second 'views' is the directory name.
app.use(bodyParser.urlencoded({ extended: true }));
// extended can also be false
// https://stackoverflow.com/questions/29960764/what-does-extended-mean-in-express-4-0

app.use(express.static(path.join(__dirname, 'public')));
// directly forwarded to the file system.
// doesn't get handled by express. 

// Middle ware for SEQUELIZE ------------
// I can store anything in the middleware / in my request so that I can use it anywhere in my app conveniently. 
// app.use((req, res, next) => {
//     // This only a middleware, does not create user on its own. need the bottom lines.
//     // This will NOT run automatically, only when requested. It's like reducer in Redux.
//     User.findByPk(1)
//         .then(user => {
//             // storing into req.user. Like session. 
//             req.user = user;
//             // then call the next app.use below.
//             next();
//         })
//         .catch(err => console.log('ERR in APP Middleware?', err));
// });
// --------------- MongoDB -----------------
const mongoConnect = require('./helper/database').mongoConnect;
const User = require('./models/user');

app.use((req, res, next) => {
    User.findById('5cf40c147d755355ac8eac29')
        .then(user => {
            req.user = new User(user.name, user.email, user.cart, user._id);
            next();
        })
        .catch(err => console.log("APP find User ERR?", err))
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
// ---------------  -----------------

// 404 error page should be the last one.
app.use(errorController.renderError);

// ------------ MONGODB ------------
// npm install mongodb --save
mongoConnect(() => {
    // mongoConnect((response) => {
    // because I decided to pass cb (from helper/database), I need cb argument for mongoConnect(<here>).
    // the cb there also has an argument, the 'r'. Here, I'll say response.
    // console.log(response); // response is the client.
    // keep in mind that I don't have to pass the cb. 
    // It was just to console.log the response.
    // --------------- ID existance validation -----------------
    // I need ID validation
    app.listen(3000);
});

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
