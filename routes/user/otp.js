const express = require('express');
const otpController = require('../../controllers/otpController');
const router = express.Router();


router.post('/sentotp', otpController.sendOTP);
router.post('/verifyotp', otpController.verifyOTP);
router.post('/sendResetOtp',otpController.sentResetOTP)
router.post('/verifyResetOTP',otpController.verifyResetOTP)
router.post('/resetpassword',otpController.resetpassword)


module.exports = router;