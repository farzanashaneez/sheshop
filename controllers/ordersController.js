const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const Wallet = require("../models/walletSchema");
const User = require("../models/userModel");
const HTTP_STATUS = require('../utils/httpStatus'); 

const orderController = {
 
  async load_dashboard(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const orderData = await Order.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalOrders = await Order.countDocuments();
        const totalPages = Math.ceil(totalOrders / limit);

        res.status(HTTP_STATUS.OK).render("orders", {
            orderData,
            currentPage: page,
            totalPages,
            limit
        });
    } catch (err) {
        console.log("error", err);
    }
},

  async changeStatus(req, res) {
    console.log("wallet chechking......!!!!!")
    console.log("in change status", req.params.status);
    const orderData = await Order.findById(req.params.orderid).sort({
      createdAt: -1,
    });
    orderData.status = req.params.status;

    await orderData.save();

    let array = orderData.products;
    if (req.params.status === "cancelled") {
      for (const cancelledProduct of array) {
        console.log("cancelledProduct", cancelledProduct);

        const result = await Product.updateOne(
          { _id: cancelledProduct.productid },
          { $inc: { quantity: cancelledProduct.quantity } }
        );
        console.log("after updatiion result :", result);
      }
    }
    const findUser = await User.findById(orderData.userid);
    console.log("findUser", findUser);
    if (findUser && req.params.status === "cancelled") {
      findUser.wallet += orderData.payedamount;
      await findUser.save();

      const userWallet = await Wallet.create({
        userId: findUser._id,
        amount: orderData.payedamount,
        description: "credited through order cancellation",
        balance: findUser.wallet,
      });
      await userWallet.save();
    }

    res.status(HTTP_STATUS.OK).send(orderData);
  },
  async getOrderdetails(req, res) {
    try{
    const orderId = req.params.orderId;
    const orderData = await Order.findById(orderId)
      .populate("userid")
      .populate("products.productid");

    res.status(HTTP_STATUS.OK).render("orderDetails", { orderData: orderData });
    }
    catch(err){
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).render('frontend/error',{title:"Not Found...!",message:"Order not found"})

    }
  },
};
module.exports = orderController;
