const express=require('express');
const router=express.Router();
const orderController=require('../../controllers/ordersController')
const authMiddleware=require('../../middlewares/verifyToken')


router.get('/',authMiddleware.authenticationVerifier,orderController.load_dashboard);
router.get('/:status/:orderid',authMiddleware.authenticationVerifier,orderController.changeStatus)
router.get('/:orderId',authMiddleware.authenticationVerifier,orderController.getOrderdetails );

module.exports=router;