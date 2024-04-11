const express=require('express');
const router=express.Router();
const reportController=require('../../controllers/reportController')

router.get('/',reportController.load_dashboard);

module.exports=router;