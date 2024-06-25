const express=require('express');
const router=express.Router();
const couponController=require('../../controllers/couponController')
const authMiddleware=require('../../middlewares/verifyToken')


router.get('/',authMiddleware.authenticationVerifier,couponController.load_dashboard);
router.get('/removecoupon/:couponId',authMiddleware.authenticationVerifier,couponController.removecoupon);

router.post('/addcoupon',authMiddleware.authenticationVerifier,couponController.addCoupon);

module.exports=router;
