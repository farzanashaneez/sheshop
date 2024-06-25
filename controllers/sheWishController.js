const wishModel = require("../models/wishListModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");




const wishlistController = {
async getwishlist(req, res) {


    console.log("get wish");

    try {
      if (req.session && req.session.userid) {

        let wishlist={};
         wishlist = await wishModel.findOne({
          userid: req.session.userid,
        }).populate("products.productid");
     

        console.log("populated",wishlist)
        res.render("frontend/wishlist", {
          wishdata: wishlist,
          
        });
      } else {
               res.render('frontend/error',{title:"Logged User not Found...!",message:"Please go to home page and then proceed"})

      }
    } catch (error) {
      res.send({ error });
      console.log(error);
    }
  

  },
  async postRemoveWishlist(req,res){
    console.log("post remove wish");
    const productId = req.body.productId;
    try {
      const wish = await wishModel.findOne({
        userid: req.session.userid,
      });
      console.log("cart.products ", wish.products[0]);
      console.log("productid ", productId);

      const productIndex = wish.products.findIndex(
        (product) => product.productid._id.toString() === productId
      );
      console.log("productIndex is ", productIndex);
      if (productIndex !== -1) {
        wish.products.splice(productIndex, 1);
        await wish.save();

        res.send("Product removed successfully");
      } else {
        res.send("Product not found");
      }
    } catch (err) {
      res.send(err);
    }
  }
}
module.exports = wishlistController;

