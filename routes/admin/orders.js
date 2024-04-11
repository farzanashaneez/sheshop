const express=require('express');
const router=express.Router();
const orderController=require('../../controllers/ordersController')

router.get('/',orderController.load_dashboard);

module.exports=router;