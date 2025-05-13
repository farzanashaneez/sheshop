require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const bcrypt=require("bcrypt")
const HttpStatus = require("../utils/httpStatus");


const maxAge = 3 * 24 * 60 * 60;

const adminloginController = {
  async load_adminlogin(req, res) {
    const token = req.cookies.jwt;
    console.log("!!!!!!!...token.....user",token)

  if (token) {
    res.redirect("/admin/dashboard");
  }
  else{
    return res.status(HttpStatus.OK).render("adminlogin");
  }
  },
  async login_admin(req, res) {
    const user = await User.findOne({ email: req.body.email,isAdmin:true });


     if (!user || !bcrypt.compareSync(req.body.password, user.password)) {

   
      res.status(HttpStatus.UNAUTHORIZED)
      .render('frontend/error',{title:"Admin not Found...!",message:"user you entered is incorrect"})
    } else {
      const accessToken = jwt.sign(
        {
          id: user._id,
          isAdmin: user.isAdmin,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: maxAge }
      );
      const { password, ...data } = user._doc;
      res.cookie('jwt', accessToken, { httpOnly: true, maxAge: maxAge * 1000 });
      res.status(HttpStatus.OK).redirect("/admin/dashboard");
    }
  },
};
module.exports = adminloginController;
