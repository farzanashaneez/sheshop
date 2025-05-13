const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const OTP = require("../models/otpModel");
const crypto = require("crypto");
var nodemailer = require("nodemailer");
const HttpStatus = require("../utils/httpStatus");

exports.signup = async (req, res) => {
  console.log(req.body);
  try {
    const { name, email, password, otp } = req.body;
    // Check if all details are provided
    if (!name || !email || !password || !otp) {
      return res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        message: "All fields are required",
      });
    }
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: "User already exists",
      });
    }
    // Find the most recent OTP for the email
    const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
    if (response.length === 0 || otp !== response[0].otp) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: "The OTP is not valid",
      });
    }
    // Secure password
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: `Hashing password error for ${password}: ` + error.message,
      });
    }
    const code = crypto.randomBytes(3).toString("hex");
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      referalCode: code,
    });
    return res.status(HttpStatus.OK).json({
      success: true,
      message: "User registered successfully",
      user: newUser,
    });
  } catch (error) {
    console.log(error.message);
    return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};
exports.redeemCoupon = async (req, res) => {
  const code = crypto.randomBytes(3).toString("hex");
};
exports.shareCoupon = async (req, res) => {
  const { email, couponUrl } = req.body;

  // Process the form data, e.g., send the coupon code to the provided email
  console.log(`Coupon code shared with ${email}`);

  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  var mailOptions = {
    from: "farzanaShaneez@gmail.com",
    to: "farzanaShaneez@gmail.com",
    subject: "Sending Email using Node.js",
    text: `
  Hello!

  Thank you for signing up with us. As a special offer, here is your coupon code:

  ${couponUrl}

  You can use this coupon link to get a discount on your registration. If you share your coupon code with your friends and they sign up using your coupon, you'll both receive $50 in your wallets!

 
  Best regards,
  The Example Team
`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      res.status(HttpStatus.NOT_FOUND).json({ error });
    } else {
      res.status(HttpStatus.OK).json({ message: "Coupon shared successfully" });
    }
  });
};

exports.getRedeemCoupon = async (req, res) => {
  res.status(HttpStatus.OK).render("frontend/login");
};
