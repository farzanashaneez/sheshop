const express = require('express');
const router = express.Router();

const adminlogin_route = require('./admin/admin_login.js');
const adminpanel_route = require('./admin/admin_panel.js');
//const adminSignup_route=require('./admin/admin_signup.js');
const categories_route = require('./admin/categories.js');
const brand_route = require('./admin/brands.js');

const adminproducts_route = require('./admin/products.js');
const adminorder_route = require('./admin/orders.js');
const coupon_route = require('./admin/coupon.js');
const customer_route = require('./admin/customers.js');
const report_route = require('./admin/report.js');
// const userlogin_route = require('./user/userlogin.js');
// const usersignup_route = require('./user/usersignup.js');
const home_route = require('./user/home.js');
const products_route = require('./user/products.js');
const cart_route=require('./user/cart.js');
const wishlist_route=require('./user/wishlist.js');

const otp_route=require('./user/otp.js')
const signup=require('./user/signup.js')
const profileroute=require('./user/profile.js')

router.use('/admin_login', adminlogin_route);
router.use('/admin/dashboard', adminpanel_route);
router.use('/admin/orders', adminorder_route);
router.use('/admin/categories', categories_route);
router.use('/admin/brands', brand_route);
router.use('/admin/products', adminproducts_route);
router.use('/admin/customers', customer_route);
router.use('/admin/coupons', coupon_route);
router.use('/admin/reports', report_route);
router.use('/home', home_route);
router.use('/products', products_route);
router.use('/otp/', otp_route);
router.use('/signup', signup);
router.use('/profile',profileroute);
router.use('/cart',cart_route);
router.use('/wishlist',wishlist_route);



// Multer Settings
const multer = require("multer")
const storage = require("../helpers/multer.js")
const upload = multer({ storage: storage })
router.use("/public/uploads", express.static("/public/uploads"))

module.exports =router