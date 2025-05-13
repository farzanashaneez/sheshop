const otpGenerator = require('otp-generator');
const OTP = require('../models/otpModel');
const User = require('../models/userModel');
const Wallet=require('../models/walletSchema')
const bcrypt=require("bcrypt")
const crypto=require("crypto")
const HTTP_STATUS = require('../utils/httpStatus'); 


exports.sendOTP = async (req, res) => {
  try {
   
    const { email } = req.body;
   

    // Check if user is already present
    const checkUserPresent = await User.findOne({ email });
    // If user found with provided email
    if (checkUserPresent) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User is already registered',
      });
    }
    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    let result = await OTP.findOne({ otp: otp });
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
      });
      result = await OTP.findOne({ otp: otp });
    }
    const otpPayload = { email, otp };
   
    const otpBody = await OTP.create(otpPayload);
    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      otp,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
  }
};
exports.verifyOTP=  async (req, res) => {
 


  const { name, email, password, otp ,couponCode} = req.body;



  try {
    const OtpUser = await OTP.findOne({ email }).sort({ createdAt: -1 });
    let isReferalSigniin=false;

    if (!OtpUser) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'otp not found' });
    }
    if(OtpUser.otp===otp){
    const saltRounds = 10; 
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const code=crypto.randomBytes(3).toString('hex');
    let  newUser;
      if(!couponCode){
     newUser = await User.create({
      firstname:name,
      email,    
      password: hashedPassword,
      referalCode:code,

    });
  }
  else{
    isReferalSigniin=true;
    const findUser=await User.findOne({referalCode:couponCode});

    newUser = await User.create({
      firstname:name,
      email,    
      password: hashedPassword,
      referalCode:code,
      wallet:findUser?50:0
    });

   
    if(findUser){
      findUser.wallet+=50;
      await findUser.save();

      const userWallet1 = await Wallet.create({
        userId:findUser._id,
        amount:50,    
        description:"credited through referal code",
        balance:newUser.wallet
      });
      await userWallet1.save();
  
    }

  }

    await newUser.save();

    if(isReferalSigniin){
    const userWallet = await Wallet.create({
      userId:newUser._id,
      amount:50,    
      description:"credited by signup using referal code",
      balance:newUser.wallet
    });
    await userWallet.save();
  }


    req.session.userid = newUser._id;
    return res.status(HTTP_STATUS.OK).json({ 
      message: 'OTP verified successfully',
      verified:true
       });
  }
  else{
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
      message: 'OTP you entered is incorrect',
      verified:false
   });

  }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Error verifying OTP' });
  }
};
exports.sentResetOTP=async (req, res) => {
  try {
   
    const { email } = req.body;
   

    // Check if user is already present
    const checkUserPresent = await User.findOne({ email });
    // If user found with provided email
    if (!checkUserPresent) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Not A Registered User',
      });
    }
    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    let result = await OTP.findOne({ otp: otp });
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
      });
      result = await OTP.findOne({ otp: otp });
    }
    const otpPayload = { email, otp };
    console.log("send otp is :",otp)
    const otpBody = await OTP.create(otpPayload);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'OTP sent successfully',
      otp,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
  }
};
exports.resetpassword=  async (req, res) => {
  const {newPassword,email} = req.body;
  console.log(req.body)

  try {
   const updateUser=await User.findOne({ email });
    const saltRounds = 10; 
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    
        
      updateUser.password=hashedPassword,
    
    await updateUser.save();
    
    return res.status(HTTP_STATUS.OK).json({ 
      message: 'Password reset successfully',
      isReset:true
       });
  }
  
   catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Error verifying OTP' });
  }
};
exports.verifyResetOTP=  async (req, res) => {
  const { name, email, password, otp } = req.body;
  console.log(req.body)

  try {
    const OtpUser = await OTP.findOne({ email }).sort({ createdAt: -1 });

    if (!OtpUser) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'otp not found' });
    }
    if(OtpUser.otp===otp){
   
    return res.status(HTTP_STATUS.OK).json({ 
      message: 'OTP verified successfully',
      verified:true
       });
  }
  else{
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
      message: 'OTP you entered is incorrect',
      verified:false
   });

  }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Error verifying OTP' });
  }
};


