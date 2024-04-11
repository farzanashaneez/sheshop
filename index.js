const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
var path = require('path');

const app = express();

/* configure body-parser */
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

/* configure view engine */
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const {  adminlogin_route,
    adminpanel_route,
    categories_route,
    adminproducts_route,
    adminorder_route,
    coupon_route,
    customer_route,
    report_route,
    userlogin_route,
    usersignup_route,
    home_route,
    products_route,
    productdetails_route } = require('./routes');

//app.use('/admin_login', adminlogin_route);
app.use('/admin/dashboard', adminpanel_route);
app.use('/admin/orders', adminorder_route);
app.use('/admin/categories', categories_route);
app.use('/admin/products', adminproducts_route);
app.use('/admin/customers', customer_route);
app.use('/admin/coupons', coupon_route);
app.use('/admin/reports', report_route);
// app.use('/home', home_route);
// app.use('/products', products_route);
// app.use('/productdetails', productdetails_route);
// app.use('/user_login', userlogin_route);
// app.use('/user_signup', usersignup_route);



/* connecting to the database */
mongoose.connect('mongodb://localhost:27017/SheShop')
.then(() => {
    console.log("Successfully connected to the database");
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});

/* listen for requests */
app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});