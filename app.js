const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const adminRoutes = require("./routes/admin");
const shopRoutes = require('./routes/shop');
const authRouters = require('./routes/auth');
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

const User = require('./models/user');
// --------------- MongoDB -----------------
// const mongoConnect = require('./helper/database').mongoConnect;

// --------------- MiddleWare -----------------
app.use((req, res, next) => {
    User.findById('5cf56c93e59d2b1978fa71cc') // Just this user for now. because there is no login/signup
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log("APP find User ERR?", err))
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRouters);
// ---------------  -----------------

// 404 error page should be the last one.
app.use(errorController.renderError);

// ------------ MONGOOSE ------------
// IMPORTANT NOTE, mongoose is based on MongoDB, make sure I UNDERSTAND MongoDB FIRST!!!!
// ODM --> A Object-Document Mapping Library
// npm i --save mongoose
const mongoose = require('mongoose');
mongoose.connect(`mongodb+srv://${process.env.mongoID}:${process.env.mongoPW}@cluster0-kl0m7.mongodb.net/shop?retryWrites=true&w=majority`, { useNewUrlParser: true })
    .then(r => {
        User.findOne()
            .then(user => {
                if (!user) {
                    // First, a User enters the shop with empty cart. So create instance first.
                    // Just this user for now. because there is no login/signup
                    const user = new User({
                        name: 'Nate',
                        email: 'nate@nate.com',
                        cart: {
                            items: []
                        }
                    });
                    user.save();
                }
            });
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
