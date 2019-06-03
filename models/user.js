// // importing 'mongodb' because I need to create an id. MongoDB uses BSON and id is stored as ObjectId.
// const mongodb = require('mongodb');
// const getDb = require('../helper/database').getDb;

// class User {
//     constructor(username, email, cart, id) {
//         this.name = username;
//         this.email = email;
//         // User will always have cart.
//         this.cart = cart; // {items: []}
//         this._id = id;
//     }
//     save() {
//         const db = getDb();
//         return db.collection('users').insertOne(this);
//     }
//     addToCart(product) {
//         // First, find the product if it's in the cart already.
//         // If not, it will return -1.
//         const cartProductIdx = this.cart.items.findIndex(cp => {
//             // find if there are products in the cart.
//             // IMPORTANT: because of the way MongoDB stores the data, two types are different. 
//             return cp.productId.toString() === product._id.toString();
//         });
//         let newQuantity = 1; // add 1 when product is added to cart.
//         const updatedCartItems = [...this.cart.items]; // copy items
//         // if there is product in the cart already, update quantity to new.
//         if (cartProductIdx >= 0) {
//             newQuantity = this.cart.items[cartProductIdx].quantity + 1;
//             updatedCartItems[cartProductIdx].quantity = newQuantity;
//         } else {
//             // If there isn't product in the cart, then push it in.
//             updatedCartItems.push({
//                 // I will save the id as 'productId' !!!!!!!!!!!!
//                 productId: new mongodb.ObjectId(product._id),
//                 quantity: 1
//             });
//         }
//         // now, the cart will be updated with copied(new) one.
//         const updatedCart = { items: updatedCartItems };

//         const db = getDb();
//         return db.collection('users')
//             .updateOne(
//                 { _id: new mongodb.ObjectId(this._id) },
//                 // Tells how to update: Where I pass an object which hold all the information about which field to update. 
//                 { $set: { cart: updatedCart } }
//             );
//     }
//     getCart() {
//         // This one is hard, make sure read thoroughly to understand.
//         const db = getDb();
//         const productIds = this.cart.items.map(item => item.productId)
//         // $in will help me to find products which IDs are included in the array.
//         return db.collection('products')
//             .find({ _id: { $in: productIds } })
//             .toArray()
//             .then(products => {
//                 return products.map(product => {
//                     return {
//                         ...product,
//                         quantity: this.cart.items.find(item => {
//                             return item.productId.toString() === product._id.toString();
//                         }).quantity
//                     }
//                 });
//             });
//         // this is because I am only displaying Id in the user's cart.
//         // So in order to manage cart with more information, above codes are necessary.
//         // return this.cart;
//     }
//     deleteItemFromCart(id) {
//         const updatedCartItems = this.cart.items.filter(item => {
//             return item.productId.toString() !== id.toString();
//         })
//         const db = getDb();
//         return db.collection('users')
//             .updateOne(
//                 { _id: new mongodb.ObjectId(this._id) },
//                 { $set: { cart: { items: updatedCartItems } } }
//             );
//     }
//     addOrder() {
//         const db = getDb();
//         return this.getCart() // I need this because I also need detail product info in the order, not just id.
//             .then(products => {
//                 const order = {
//                     items: products,
//                     user: {
//                         _id: new mongodb.ObjectId(this._id),
//                         name: this.name
//                     }
//                 };
//                 // Here I am duplicating data because this will end up in the orders collection and in the users collection. 
//                 // But it's okay because the user data in here might change for sure, but it doesn't need to be updated in all orders 
//                 // ... orders are already made, the process is already done so there is no need to update.
//                 // If I care, I will not duplicate in here.
//                 return db.collection('orders').insertOne(order)
//             })
//             .then(r => {
//                 this.cart = { items: [] };
//                 return db.collection('users').updateOne(
//                     { _id: new mongodb.ObjectId(this._id) },
//                     { $set: { cart: { items: [] } } }
//                 );
//             });
//     }
//     getOrders() {
//         const db = getDb();
//         return db.collection('orders').find({ 'user._id': new mongodb.ObjectId(this._id) }).toArray();
//     }
//     static findById(id) {
//         const db = getDb();
//         return db.collection('users')
//             // .find({ _id: new mongodb.ObjectId(id) }).next();
//             // This is the same as ...
//             .findOne({ _id: new mongodb.ObjectId(id) });
//         // .find may return multiple, that is why .next() is necessary.
//     }
// }

// module.exports = User;