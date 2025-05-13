const Brand = require("../models/brandModel");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Cart = require("../models/cartModel");
const User = require("../models/userModel");
const Wish = require("../models/wishListModel");
const bcrypt = require("bcrypt");

const passport = require("passport");
const HttpStatus = require("../utils/httpStatus");

const adminController = {
  async getHome(req, res) {
    console.log("@home.sessn..", req.session);
    console.log("@home.user..", req.user);
    if (req.isAuthenticated()) {
      req.session.userid = req.session.passport.user;
      console.log("ys authenticated");
    } else console.log("not authenticated");

    let data;
    try {
      let cart;
      if (req.session && req.session.userid) {
        const [categoryData, brandData, productData, userData, wishData] =
          await Promise.all([
            Category.find({}),
            Brand.find({}),
            Product.find().sort({ id: -1 }),
            User.findById(req.session.userid),
            Wish.findOne({ userid: req.session.userid }),
          ]);

        let subtotal = 0;
        let updatedCart = [];
        console.log("userdata", userData);
        cart = await Cart.findOne({ userid: req.session.userid });

        if (cart) {
          await cart.populate("products.productid");
          console.log("populated", cart);
          updatedCart = cart.products.map((item) => {
            const productTotal = item.productid.price * item.quantity || 0;
            return {
              _id: item.productid._id,
              name: item.productid.name,
              brand: item.productid.brand,
              category: item.productid.category,
              description: item.productid.description,
              image: item.productid.image,
              quantity: item.quantity,
              volume: item.productid.volume,
              color: item.productid.color,
              price: item.productid.price,
              ratings: item.productid.ratings,
              updatedAt: item.productid.updatedAt,
              totalAmount: productTotal,
            };
          });

          subtotal = updatedCart.reduce(
            (total, item) => total + item.totalAmount,
            0
          );
        }
        console.log("wishdata", wishData);
        data = {
          categoryData: categoryData,
          brandData: brandData,
          productData: productData,
          userData: userData,
          cartData: updatedCart,
          wishcount: wishData?.products?.length || 0,
          subtotal,
        };
      } else {
        const [categoryData, brandData, productData] = await Promise.all([
          Category.find({}),
          Brand.find({}),
          Product.find().sort({ id: -1 }),
        ]);

        data = {
          categoryData: categoryData,
          brandData: brandData,
          productData: productData,
        };
      }

      res.status(HttpStatus.OK).render("frontend/home", data);
    } catch (error) {
      res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
    }
  },
  async postSignin(req, res) {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      console.log("***user.....:", user, email);
      if (user && user.isBlock) {
        res.status(HttpStatus.UNAUTHORIZED).json({ error: "Blocked user ...!" });
      } else {
        if (user && bcrypt.compareSync(password, user.password)) {
          if (req.session) {
            console.log("***********session");
            req.session.userid = user._id;
            res.status(HttpStatus.OK).json({ success: true });
          } else {
            console.error("Session object is not initialized");
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: "Internal  error" });
          }
        } else {
          // Incorrect credentials, return an error response
          res.status(HttpStatus.NOT_FOUND).json({ error: "Incorrect email or password" });
        }
      }
    } catch (err) {
      console.log(err);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: "An error occurred" });
    }
  },
  // postRegister(req, res) {},
  getLogout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        console.error(err);
      }

      res.redirect("/home");
    });
  },
  getGoogleLogin(req, res, next) {
    passport.authenticate("google", { scope: ["profile", "email"] })(
      req,
      res,
      next
    );
  },
  getGoogleCallback(req, res, next) {
    passport.authenticate("google", {
      failureRedirect: "/home",
      successRedirect: "/home",
    })(req, res, next);
  },
};
module.exports = adminController;
