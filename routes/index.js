console.log("adminController");
const adminlogin_route = require('./admin/admin_login.js');
const adminpanel_route = require('./admin/admin_panel.js');
const categories_route = require('./admin/categories.js');
const adminproducts_route = require('./admin/products.js');
const adminorder_route = require('./admin/orders.js');
const coupon_route = require('./admin/coupon.js');
const customer_route = require('./admin/customers.js');
const report_route = require('./admin/report.js');
const userlogin_route = require('./user/userlogin.js');
const usersignup_route = require('./user/usersignup.js');
const home_route = require('./user/home.js');
const products_route = require('./user/products.js');
const productdetails_route = require('./user/productdetail.js');


module.exports = {
    adminlogin_route,
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
    productdetails_route
};