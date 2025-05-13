const Cart = require("../models/cartModel");
const User = require("../models/userModel");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const Coupon = require("../models/couponModel");
const Wallet = require("../models/walletSchema");

const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const HTTP_STATUS = require("../utils/httpStatus");
const HttpStatus = require("../utils/httpStatus");

const cartController = {
  async getCart(req, res) {
    try {
      if (req.session && req.session.userid) {
        const cart = await Cart.findOne({
          userid: req.session.userid,
        }).populate("products.productid");

        const updatedCart = cart?.products.map((item) => {
          const productTotal = item.productid.price * item.quantity || 0;
          console.log(
            "productTotal  :  ",
            productTotal,
            "item.quantity",
            item.quantity
          );
          return {
            _id: item.productid._id,
            name: item.productid.name,
            brand: item.productid.brand,
            category: item.productid.category,
            description: item.productid.description,
            image: item.productid.image,
            productcount: item.productid.quantity,
            quantity: item.quantity,
            volume: item.productid.volume,
            color: item.productid.color,
            price: item.productid.price,
            ratings: item.productid.ratings,
            updatedAt: item.productid.updatedAt,
            totalAmount: productTotal,
          };
        });

        const subtotal = updatedCart?.reduce(
          (total, item) => total + item.totalAmount,
          0
        );
        const shippingcharge = 0;
        const totalpayment = shippingcharge + subtotal;
        res.status(HTTP_STATUS.OK).render("frontend/cart", {
          cart: updatedCart,
          subtotal,
          shippingcharge,
          totalpayment,
        });
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
          .render("frontend/error", {
            title: "Logged User not Found...!",
            message: "Please go to home page and then proceed",
          });
      }
    } catch (error) {
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .render("frontend/error", { title: "Error", message: error.message });
    }
  },
  async postremoveProduct(req, res) {
    console.log("post remove product");
    const productId = req.body.productId;
    try {
      const cart = await Cart.findOne({
        userid: req.session.userid,
      });
      console.log("cart.products ", cart.products[0]);
      console.log("productid ", productId);

      const productToRestock = await Product.findById(req.body.productId);

      const productIndex = cart.products.findIndex(
        (product) => product.productid._id.toString() === productId
      );

      if (productIndex !== -1) {
        productToRestock.quantity += cart.products[productIndex].quantity;
        cart.products.splice(productIndex, 1);
        await cart.save();
        await productToRestock.save();

        res.status(HTTP_STATUS.OK).send("Product removed successfully");
      } else {
        res.status(HTTP_STATUS.NOT_FOUND).send("Product not found");
      }
    } catch (err) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(err);
    }
  },
  async postupdatecart(req, res) {
    console.log("you are in post update cart");
    console.log("product updated", req.body);

    const array = req.body.updatedCart;
    try {
      let cart = await Cart.findOne({
        userid: req.session.userid,
      });

      for (const reqProduct of array) {
        console.log("reqProduct", reqProduct);
        const cartProduct = cart.products.find(
          (cartItem) => cartItem.productid.toString() === reqProduct.productid
        );
        console.log("cartProduct", cartProduct);

        const quantityDifference =
          reqProduct.quantity - (cartProduct ? cartProduct.quantity : 0);

        const final = await Product.updateOne(
          { _id: cartProduct.productid },
          { $inc: { quantity: -quantityDifference } }
        );
        console.log("quantity final", final);
      }
      cart.products = req.body.updatedCart;

      array.forEach((element) => {
        const productIndex = cart.products.findIndex(
          (item) => item.productid.toString() === element.productid.toString()
        );

        cart.products[productIndex].quantity = element.quantity;
      });

      await cart.save();

      console.log("product updated", cart);

      res.status(HTTP_STATUS.OK).send("Product updated successfully");
    } catch (err) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(err);
    }
  },
  async getCheckout(req, res) {
    console.log("get checkout");

    try {
      if (req.session && req.session.userid) {
        const cart = await Cart.findOne({
          userid: req.session.userid,
        })
          .populate("products.productid")
          .populate("couponid");

        if (!cart) {
          throw new Error("Cart not found");
        } //coupondiscount,offerdiscount
        const updatedCart = cart.products.map((item) => {
          const productTotal = item.productid.price * item.quantity || 0;
          const totalWithoutDiscount =
            item.productid.regularprice * item.quantity || 0;

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
            regularprice: item.productid.regularprice,
            price: item.productid.price,
            ratings: item.productid.ratings,
            updatedAt: item.productid.updatedAt,
            totalAmount: totalWithoutDiscount,
            offerReductAmount: totalWithoutDiscount - productTotal,
          };
        });

        const subtotal = updatedCart.reduce(
          (total, item) => total + item.totalAmount,
          0
        );
        const offerdiscount = updatedCart.reduce(
          (total, item) => total + item.offerReductAmount,
          0
        );
        const coupondiscount = cart.couponid?.offerPrice || 0;
        const shippingcharge = 0;
        const totalpayment =
          shippingcharge + subtotal - offerdiscount - coupondiscount;
        const userData = await User.findById(req.session.userid);

        if (updatedCart.length === 0) {
          throw new Error("No cart items are added in the list");
        }

        console.log(
          "cart.couponid.name",
          cart.couponid,
          cart.couponid?.offerPrice
        );
        console.log("offerdiscount", offerdiscount);
        res.status(HTTP_STATUS.OK).render("frontend/checkout", {
          cart: updatedCart,
          userData,
          coupon: coupondiscount,
          couponname: cart.couponid?.name || "",
          subtotal,
          offerdiscount,
          coupondiscount,
          shippingcharge,
          totalpayment,
        });
      } else {
        res.status(HTTP_STATUS.NOT_FOUND).render("frontend/error", {
          title: "Logged User not Found...!",
          message: "Please go to home page and then proceed",
        });
      }
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).render("frontend/error", {
        title: "No products in the cart",
        message: error.message,
      });
    }
  },

  async postPlaceOrder(req, res) {
    try {
      if (req.session && req.session.userid) {
        const addressIndex = req.body.addressIndex;
        const totalamount = parseInt(req.body.totalamount);
        const discount =
          parseInt(req.body.offerdiscount) + parseInt(req.body.coupondiscount);
        const payedamount = parseInt(totalamount - discount);

        const userid = req.session.userid;
        const [userData, cart] = await Promise.all([
          User.findById(userid),
          Cart.findOne({ userid }),
        ]);

        if (!cart) {
          throw new Error("Cart not found");
        }
        const orderid = uuidv4();
        // Construct the order object
        const order = new Order({
          userid,
          orderid,
          products: cart.products,
          totalamount: totalamount,
          discount,
          payedamount,
          address: userData.useraddress[addressIndex],
          status: "processing",
        });

        // Save the order to the database
        await order.save();
        await Cart.deleteOne({ userid });
        res.status(HTTP_STATUS.OK).send({ order: order });
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).render("frontend/error", {
          title: "Logged User not Found...!",
          message: "Please go to home page and then proceed",
        });
      }
    } catch (error) {
      throw error;
    }
  },
  async postWalletPayment(req, res) {
 
    try {
      if (req.session && req.session.userid) {
        const userid = req.session.userid;
        const userData = await User.findById(userid);
        const totalamount = parseInt(req.body.totalamount);

        if (userData.wallet >= totalamount) {
          //coupondiscount,offerdiscount
          const addressIndex = req.body.addressIndex;
          const discount =
            parseInt(req.body.offerdiscount) +
            parseInt(req.body.coupondiscount);
          const payedamount = parseInt(totalamount - discount);

          const cart = await Cart.findOne({ userid });

          if (!cart) {
            throw new Error("Cart not found");
          }
          const orderid = uuidv4();
          // Construct the order object
          const order = new Order({
            userid,
            orderid,
            products: cart.products,
            totalamount: totalamount,
            discount,
            payedamount,
            paymentType: "wallet",
            address: userData.useraddress[addressIndex],
            status: "processing",
          });

          // Save the order to the database
          await order.save();
          await Cart.deleteOne({ userid });
          userData.wallet = userData.wallet - payedamount;
          await userData.save();
          const userWallet = await Wallet.create({
            userId: userid,
            amount: payedamount,
            description: "debited by wallet purchase",
            isCredited: false,
            balance: userData.wallet,
          });
          await userWallet.save();

          res.status(HTTP_STATUS.OK).send({
            isSuccess: true,
            order: order,
            message: "Successfully placed the order",
          });
        } else {
          res.status(HTTP_STATUS.OK).send({
            isSuccess: false,
            message: "Your wallet doesn't have enough money",
          });
        }
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).render("frontend/error", {
          title: "Logged User not Found...!",
          message: "Please go to home page and then proceed",
        });
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  async postVerifyToken(req, res) {
    try {
      const couponname = req.body.coupon;
      const totalToPay = req.body.totalamount;
      const findCoupon = await Coupon.findOne({ name: couponname });

      const userid = await Coupon.findById(findCoupon._id);

      if (!findCoupon) {
        
        res.status(HttpStatus.NOT_FOUND).json({ valid: false, message: "Invalid coupon" });
      } else {
        if (findCoupon.expireOn < new Date()) {
          res.status(400).json({ valid: false, message: "Coupon expired" });
        } else if (totalToPay < findCoupon.minimumPrice) {
          res.status(HttpStatus.NOT_FOUND).json({
            valid: false,
            message: `Minimum purchase amount should be ${findCoupon.minimumPrice}`,
          });
        } else if (findCoupon.userId.some((id) => id === req.session.userid)) {
          res.status(HttpStatus.NOT_FOUND).json({ valid: false, message: "Redeemed coupon.. " });
        } else {
          const cart = await Cart.findOne({
            userid: req.session.userid,
          });
          cart.couponid = findCoupon._id;

          await cart.save();
          console.log("Cart after updating couponid:", cart);

          findCoupon.userId.push(req.session.userid.toString());
          await findCoupon.save();

          res.status(HttpStatus.OK).json({ valid: true, discount: findCoupon.offerPrice });
        }
      }
    } catch (error) {
      console.error(error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ valid: false, message: "Error verifying coupon" });
    }
  },
  async removeToken(req, res) {
    try {
      const cart = await Cart.findOne({
        userid: req.session.userid,
      });

      const findCoupon = await Coupon.findOne({ _id: cart.couponid });
      const tempUserArray = findCoupon.userId.filter(
        (x) => x != req.session.userid
      );
      findCoupon.userId = tempUserArray;
      await findCoupon.save();

      cart.couponid = undefined;
      await cart.save();
      res.status(HttpStatus.OK).json({ valid: true });
    } catch (error) {
      console.error(error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error verifying coupon" });
    }
  },
};
module.exports = cartController;
