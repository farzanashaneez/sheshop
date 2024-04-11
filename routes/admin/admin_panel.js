const express=require('express');
const router=express.Router();
const adminController=require('../../controllers/adminPanelController')

router.get('/',adminController.load_dashboard);

module.exports=router;