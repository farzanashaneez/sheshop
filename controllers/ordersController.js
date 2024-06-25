const Order=require('../models/orderModel')
const Product=require('../models/productModel')
const Wallet=require('../models/walletSchema')
const User = require("../models/userModel");



const orderController={
    async load_dashboard(req,res){
        const orderData=await Order.find().sort({createdAt:-1});
       
        res.render('orders',{orderData});
    },
    async changeStatus(req,res){
        console.log("in change status",req.params.status)
        const orderData=await Order.findById(req.params.orderid).sort({createdAt:-1});
       orderData.status=req.params.status;

       await orderData.save();

       let array=orderData.products;
       if(req.params.status==='cancelled'){
        for (const cancelledProduct of array) {
            console.log("cancelledProduct",cancelledProduct)
           
            const result= await Product.updateOne(
              { _id: cancelledProduct.productid },
              { $inc: { quantity: cancelledProduct.quantity } }
            );
            console.log("after updatiion result :",result)
          }
       }
       const findUser=await User.findById(orderData.userid);
     console.log("findUser",findUser)
     if(findUser){
       findUser.wallet+=orderData.payedamount;
       await findUser.save();

       const userWallet = await Wallet.create({
        userId:findUser._id,
        amount:orderData.payedamount,    
        description:"credited through order cancellation",
        balance:findUser.wallet
      });
      await userWallet.save();
     }
  
        res.send(orderData);
    },
    async getOrderdetails(req, res){

        const orderId = req.params.orderId;
        const orderData = await Order.findById(orderId)
    .populate('userid')
    .populate('products.productid');
            
console.log(orderData)      
  res.render('orderDetails', { orderData: orderData });
    }
};
module.exports=orderController