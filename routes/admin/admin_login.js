const express=require('express');
const router=express.Router();
const adminloginController=require('../../controllers/adminLoginController')

router.get('/',adminloginController.load_adminlogin);
router.post('/',adminloginController.login_admin);


module.exports=router;