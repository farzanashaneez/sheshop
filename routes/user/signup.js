const express = require('express');
const signupController = require('../../controllers/sheHomeSignup');
const router = express.Router();

router.post('/',signupController.signup);
router.post('/coupon',signupController.redeemCoupon);
router.post('/sharecoupon',signupController.shareCoupon);
router.get('/coupon', signupController.getRedeemCoupon)


module.exports = router;