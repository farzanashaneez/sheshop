const express=require('express');
const router=express.Router();
const customerController=require('../../controllers/customerController')

router.get('/',customerController.load_dashboard);

module.exports=router;