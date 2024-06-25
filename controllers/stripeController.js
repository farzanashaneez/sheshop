require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { default: mongoose } = require("mongoose");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const User=require("../models/userModel")
const { v4: uuidv4 } = require('uuid'); 




const stripeController = {
  async getCardPayment(req, res) {

    try {
      if (req.session && req.session.userid) {

        const addressIndex = req.body.addressIndex;
        const totalamount = req.body.totalamount;
        const discount=parseInt(req.body.offerdiscount)+parseInt(req.body.coupondiscount)
        const payedamount=totalamount-discount;

        const userid = req.session.userid;
        const userData = await User.findById(userid);
        console.log("you are in cardpayment",userData);

        const cart = await Cart.findOne({ userid }).populate(
          "products.productid"
        );
        console.log("cart ", cart.products[0]);

        if (!cart) {
          throw new Error("Cart not found");
        }
        const orderid=uuidv4();
        // Construct the order object
        const order = new Order({
          userid,
          orderid,
          products: cart.products,
          totalamount: totalamount,
          discount,
          payedamount,
          address: userData.useraddress[addressIndex],
          status: "pending",
          paymentType:"card"
        });
        await order.save();
        req.session.orderid=order._id;
        console.log("line_items");

        const line_items = cart.products.map((item) => {
          return {
            price_data: {
              currency: "usd",
              product_data: {
                name: item.productid.name,
              },
              unit_amount: item.productid.regularprice * 100,
            },
            quantity: item.quantity,
          };
        });
        console.log("discount############",discount)
       if(discount){
        const coupon = await stripe.coupons.create({
          amount_off: discount*100,
          currency:'usd',
          duration: 'once',
        });
        console.log("line_items", line_items);
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: line_items,
         
            discounts: [
              {
                coupon: coupon.id,
              },
            ], 
            mode: "payment",
 
           success_url: `${process.env.SERVER_URL}/cart/checkout/cardpayment/success`,
          cancel_url: `${process.env.SERVER_URL}/cart/checkout/cardpayment/failure`,
        });
        console.log("session.url",session)
        res.json({ url: session.url });
      }
      else{
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: line_items,
            mode: "payment",
 
           success_url: `${process.env.SERVER_URL}/cart/checkout/cardpayment/success`,
          cancel_url: `${process.env.SERVER_URL}/cart/checkout/cardpayment/failure`,
        });
      
        console.log("in else if")
        res.json({ url: session.url });
      }

       
       
        // Save the order to the database 4000000000009995
       
       
      } else {
               res.render('frontend/error',{title:"Logged User not Found...!",message:"Please go to home page and then proceed"})

      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: error.message });
    }
  },
  async getCardPaymentAfterFailure(req, res) {

    try {
      if (req.session && req.session.userid) {
        const orderid=req.params.orderid;
        const order=await Order.findById(orderid)
        .populate('products.productid')
        

       
        req.session.orderid=new mongoose.Types.ObjectId(order._id);

        console.log(" req.session.orderid",order);

        const coupon = await stripe.coupons.create({
          amount_off: order.discount*100,
          currency:'usd',
          duration: 'once',
        });
        const line_items = order.products.map((item) => {
          return {
            price_data: {
              currency: "usd",
              product_data: {
                name: item.productid.name,
              },
              unit_amount: item.productid.price * 100,//change-price
            },
            quantity: item.quantity,
          };
        });
        console.log("line_items", line_items);
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: line_items,
          discounts: [
            {
              coupon: coupon.id,
            },
         ], 
          mode: "payment",
          success_url: `${process.env.SERVER_URL}/cart/checkout/cardpayment/success`,
          cancel_url: `${process.env.SERVER_URL}/cart/checkout/cardpayment/failure`,
        });
        console.log("session.url",session)
        res.redirect(session.url)

        // Save the order to the database
       
       
      } else {
               res.render('frontend/error',{title:"Logged User not Found...!",message:"Please go to home page and then proceed"})

      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: error.message });
    }
  },
  async getCardPaymentSuccess(req, res) {
    try {

        await Cart.deleteOne({userid:req.session.userid });
        const orderid=req.session.orderid;
        const order=await Order.findById(orderid);
        order.status="processing";
       const data=await order.save()

        req.session.orderid='';

        res.redirect('/profile')
       
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getCardPaymentFailure(req, res) {
try{
    const orderid=req.session.orderid;
    await Cart.deleteOne({userid:req.session.userid });
    const order=await Order.findById(orderid);
    order.status="pending";
   await order.save()
    //await Order.deleteOne({ orderid });
    res.redirect('/profile')
}
catch(error){
    res.status(500).json({ error: error.message });
}


  },
};
module.exports = stripeController;
