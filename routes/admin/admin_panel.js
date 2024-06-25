const express=require('express');
const router=express.Router();
const adminController=require('../../controllers/adminPanelController')
const authMiddleware=require('../../middlewares/verifyToken')

router.get('/',authMiddleware.accessLevelVerifier,adminController.get_dashboard);
module.exports=router;