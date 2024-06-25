const express=require('express');
const router=express.Router();
const customerController=require('../../controllers/customerController')
const authMiddleware=require('../../middlewares/verifyToken')


router.get('/',authMiddleware.authenticationVerifier,customerController.get_users);
router.post('/:userId/toggle-status',authMiddleware.authenticationVerifier,customerController.postBlockorUnblock)
module.exports=router;