const express=require('express');
const router=express.Router();
const couponController=require('../../controllers/couponController')

router.get('/',couponController.load_dashboard);

module.exports=router;
