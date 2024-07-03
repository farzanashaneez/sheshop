const User = require("../models/userModel");
const Order = require("../models/orderModel");
const Products = require("../models/productModel");
const Wallet = require("../models/walletSchema");
const mongoose = require("mongoose");
const AddressSchema = require("../models/addressSchema");
const Address = mongoose.model("Address", AddressSchema);

const path = require("path");
const fs = require("fs");
const PDFDocument = require("../helpers/pdfkit-tables");

const profileAddressSchema = require("../models/profileAddressSchema");

const bcrypt = require("bcrypt");

const profileController = {
  async getProfile(req, res) {
    let data;
    try {
      if (req.session && req.session.userid) {
       
        const [userData, wallethistory, orderData] = await Promise.all([
          User.findById(req.session.userid),
          Wallet.find({ userId: req.session.userid }).sort({ createdAt: -1 }),
          Order.find({ userid: req.session.userid })
            .populate("products.productid")
            .sort({ createdAt: -1 }),
        ]);


        data = {
          userData: userData,
          wallets: wallethistory,
          orderData: orderData || [],
        };
        res.render("frontend/profile", data);
      } else {
        res.render('frontend/error',{title:"User not Found",message:"No logged user found"})
      }

      // res.render("frontend/profile", data);
    } catch (error) {
      console.log(error.message);
    }
  },
  async postProfile(req, res) {
    console.log("req body", req.body);
    console.log("post editted profile");

    try {
      if (req.session && req.session.userid) {
        const userData = await User.findById(req.session.userid);

        userData.firstname = req.body.firstname;
        userData.lastname = req.body.lastname;

        await userData.save();
        res.redirect("/home");
      } else {
        res.send({ message: "no user logged" });
      }
    } catch (error) {
      console.log(error.message);
      res.send({ message: "error happened" });
    }
  },
  async postAddress(req, res) {
    console.log("req body", req.body);
    console.log("req body", req.params);
    try {
      if (req.session && req.session.userid) {
        const type = req.params.type;
        const { house, street, city, state, zipcode, phone } = req.body;
        const address1 = new Address({
          house,
          street,
          city,
          state,
          zipcode,
          phone,
        });
        const userData = await User.findById(req.session.userid);

        if (type === "1") { 
          userData.address.billingaddress = address1;
        } else if (type === "2") {
          userData.address.shippingaddress = address1;
        } else {
          return res.status(400).json({ message: "Invalid address type" });
        }
        await userData.save();
        res.redirect("/profile");
      } else {
        return res.status(400).json({ message: "no logged user found" });
      }
    } catch (error) {
      return res.status(400).json({ message: "something went wrong" });
    }
  },

  async getUseraddress(req, res) {
    console.log("req body", req.body);
    console.log("req body", req.params);
    console.log("getUserddress ");
    try {
      if (req.session && req.session.userid) {
        const userData = await User.findById(req.session.userid);
        res.render("frontend/address", { userData });
      }
    } catch (error) {
      console.log("error", error);
    }
  },
  async postUserddress(req, res) {
    console.log("in postUserddress");
    console.log("req body", req.params);
    try {
      if (req.session && req.session.userid) {
        const { house, street, city, state, zipcode, phone } = req.body;
        const address1 = new Address({
          house,
          street,
          city,
          state,
          zipcode,
          phone,
        });
        console.log("address1", address1);

        const userData = await User.findById(req.session.userid);

        userData.useraddress.push(address1);
        await userData.save();
        res.redirect("/profile/address");
      }
    } catch (error) {
      console.log("error", error);
    }
  },
  async deleteUserddress(req, res) {
   
    try {
      if (req.session && req.session.userid) {
        const index = parseInt(req.params.index);
        const userData = await User.findById(req.session.userid);
       

        userData.useraddress.splice(index, 1);

        await userData.save();
        res.json({ message: "Address removed successfully" });
      } else {
        res.status(400).json({ message: "Invalid index or user not found" });
      }
    } catch (error) {
      res.status(400).json({ error });
    }
  },
  async editUserddress(req, res) {
   
    try {
      if (req.session && req.session.userid) {
        const index = parseInt(req.params.index);
        const { house, street, city, state, zipcode, phone } = req.body;
        const address1 = new Address({
          house,
          street,
          city,
          state,
          zipcode,
          phone,
        });
        console.log("address1", address1);

        const userData = await User.findById(req.session.userid);

        userData.useraddress[index] = address1;
        await userData.save();
        res.redirect("/profile/address");
      }
    } catch (error) {
      console.log("error", error);
    }
  },

  async getcancelOrder(req, res) {
    console.log("in cancel order", req.params.orderid);
    const orderData = await Order.findById(req.params.orderid);
    const itemstatus=orderData.status;
    orderData.status = "cancelled";
    if (orderData) await orderData.save();

    let array = orderData.products;

    for (const cancelledProduct of array) {
      console.log("cancelledProduct", cancelledProduct);

      const result = await Products.updateOne(
        { _id: cancelledProduct.productid },
        { $inc: { quantity: cancelledProduct.quantity } }
      );
      console.log("after updatiion result :", result);
    }
    const findUser = await User.findById(req.session.userid);
    console.log("findUser", orderData.paymentType);

    if (findUser && itemstatus!=='pending' && orderData.paymentType !== "COD") {
      console.log("if statementdUser", orderData.paymentType);

      findUser.wallet += orderData.payedamount;
      await findUser.save();
      let desc="credited through order cancellation";
      if(itemstatus==='recieved'){
        desc="credited through order return"
      }

      const userWallet = await Wallet.create({
        userId: findUser._id,
        amount: orderData.payedamount,
        description: desc,
        balance: findUser.wallet,
      });
      await userWallet.save();
    }

    res.redirect("/profile");
  },
  
  async postreturn(req, res) {
    console.log("in postreturn",req.body)
   const {products,order_id}=req.body;


   const orderData = await Order.findById(order_id).populate('products.productid')
   console.log("orderData",orderData)
  //  const itemstatus=orderData.status || ;
   orderData.status = "returned";
    const productArray=orderData.products;
    const updatedProducts=productArray.map(product=>{
      console.log(product._id,products)
      if (products.some(p => p.toString() === product.productid._id.toString())) {
        product.isreturned = true;
      }
      return product
    })



    console.log("updatedProducts",updatedProducts)
   await orderData.save();



  // let array = orderData.products;
  let result=[];
  let totalamountreturned=0;
    for (const cancelledProduct of updatedProducts) {
  if(cancelledProduct.isreturned==true){
      result = await Products.updateOne(
       { _id: cancelledProduct.productid._id },
       { $inc: { quantity: cancelledProduct.quantity } }
     );
     totalamountreturned+=cancelledProduct.quantity*cancelledProduct.productid.price;
  }
     console.log("after updatiion result :", result);
    }
   const findUser = await User.findById(req.session.userid);
   console.log("findUser", findUser.wallet,"type of(totalamountreturned):",typeof(totalamountreturned),totalamountreturned);

   if (findUser ) {
     console.log("if statementdUser", orderData.paymentType);

     findUser.wallet +=totalamountreturned;
     await findUser.save();
     let desc="credited through order return";
     

     const userWallet = await Wallet.create({
       userId: findUser._id,
       amount: totalamountreturned,
       description: desc,
       balance: findUser.wallet,
     });
     await userWallet.save();
   }

res.json({success:true})
  },
  async getinvoice(req, res) {
    const [orderData, userData] = await Promise.all([
      Order.findById(req.params.orderid).populate("products.productid"),
      User.findById(req.session.userid)
    ]);
    if (orderData.status === "processing" || orderData.status === "recieved" || orderData.status ==='shipping') {
      res.render("frontend/invoice", { order: orderData, user: userData });
    } else {
      //res.status(400).json({ message: "invoice not found" });
      res.render('frontend/error',{title:"Not Found...!",message:"invoice not found"})

    }
  },

  async generateInvoiceReport(req, res) {
    try {
     
      const orderSample = await Order.findById(req.params.orderid).populate(
        "products.productid"
      );
      // const orderSample=array[0]

      const filename = "invoice-report.pdf";
      const doc = new PDFDocument();

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
      doc.pipe(res);
      const imagePath = path.join(
        __dirname,
        "..",
        "public",
        "images",
        "She Shop.png"
      );
      doc
        .image(imagePath, 50, 45, { width: 150 })
        .fillColor("#444444")
        .fontSize(20)
        .text("Sales Report", 10, 57, { align: "center" })
        .fontSize(10)
        .text(`created At:${new Date().toDateString()}`, 200, 65, {
          align: "right",
        })
        .moveDown(5);

      doc
        .fillColor("#444444")
        .fontSize(14)
        .text(`Ordered-at ${orderSample.orderid}`, 50, doc.y, {
          align: "center",
        })
        .moveDown(1);

      const table = {
        headers: ["Product", "Unit Cost", "Quantity", "Line Total"],
        rows: [],
      };

      // Add the patients to the table
      for (const item of orderSample.products) {
        table.rows.push([
          item.productid?.name,
          item.productid?.price,
          item.quantity,
          item.quantity*item.productid?.price,
        ]);
      }

      // Draw the table
      doc.table(table, 10, doc.y, {
        width: 590,
        prepareHeader: () => doc.font("Helvetica-Bold"),
        prepareRow: (row, i) => doc.font("Helvetica").fontSize(10),
      });

      // Calculate the height of the table
      const tableHeight = (table.rows.length + 1) * 20;

      // Move the y-position to the bottom of the table
      doc.y += tableHeight + 10;

      // Move the y-position back to the bottom of the table for the total price area
      doc.y -= tableHeight;

      // Draw the total price area
      doc
        .fillColor("#444444")
        .fontSize(12)
        .text(
          "Total Amount: $" + orderSample.totalamount.toFixed(2),
          10,
          doc.y + 10,
          { align: "right" }
        )
        .text(
          "Total Discount: $" + orderSample.discount.toFixed(2),
          10,
          doc.y + 10,
          { align: "right" }
        )
        .text(
          "Total payed: $" + orderSample.payedamount.toFixed(2),
          10,
          doc.y + 10,
          { align: "right" }
        );

      doc.moveDown();

      doc.end();
    } catch (err) {
      console.log("error", err);
      res.render('frontend/error',{title:"Error",message:"something went wrong"})

    }
  },
};
module.exports = profileController;
