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

// MySQL exercise => install by npm i mysql2 --save
// IMPORTANT: MySQL is asynchronous. So I can use .then / .catch
// const db = require('./helper/database');
// db.execute('SELECT * FROM products')
//     .then(result => {
//         // Data we want is located in first index.
//         console.log(result[0], result[1]);
//     }).catch(err => {});

app.use(express.static(path.join(__dirname, 'public')));
// directly forwarded to the file system.
// doesn't get handled by express. 

// Middle ware for SEQUELIZE ------------
// I can store anything in the middleware / in my request so that I can use it anywhere in my app conveniently. 
app.use((req, res, next) => {
    // This only a middleware, does not create user on its own. need the bottom lines.
    // This will NOT run automatically, only when requested. It's like reducer in Redux.
    User.findByPk(1)
        .then(user => {
            // storing into req.user. Like session. 
            req.user = user;
            // then call the next app.use below.
            next();
        })
        .catch(err => console.log('ERR in APP Middleware?', err));
});
// ---------------------------------------
app.use('/admin', adminRoutes);
app.use(shopRoutes);

// 404 error page should be the last one.
app.use(errorController.renderError);
// ------------ SEQUELIZE ------------
const sequelize = require('./helper/database');
// ------------ SEQUELIZE ASSOCIATION ------------
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');

// ------------ ASSOCIATION SECTION ------------
// second argument is optional.
Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product); // Optional, because association is already established.
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });
Product.belongsToMany(Order, { through: OrderItem });

// ... sync to database and create table for me.
// sequelize.sync({ force: true })
// having force attribute will overwrite the database. WILL NOT USE IN REAL DEVELOPMENT.
sequelize.sync()
    .then(result => {
        return User.findByPk(1);
        // app.listen(3000)
    })
    .then(user => {
        if (!user) {
            return User.create({ name: 'Nate', email: 'nate@nate.com' });
        }
        // Promise.resolve will which is promise will immediately resolve to user.
        // But I can omit it because it is inside .then.
        return Promise.resolve(user);
    })
    .then(user => user.createCart())
    .then(cart => app.listen(3000))
    .catch(err => console.log('HAS ERR IN APP SEQUELIZE?', err));

// const server = http.createServer(app);
// server.listen(3000);
// can become ...
// app.listen(3000);

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
