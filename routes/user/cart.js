const express = require('express');
const sheCartController = require('../../controllers/sheCartController');
const cardpaymentController=require('../../controllers/stripeController')
const router = express.Router();
const checkblock=require('../../middlewares/checkBlockedUser')

router.get('/',checkblock.checkBlocked,sheCartController.getCart);
router.post('/removeProduct',sheCartController.postremoveProduct);
router.post('/update',sheCartController.postupdatecart)

router.get('/checkout',checkblock.checkBlocked,sheCartController.getCheckout)
router.post('/placeorder',sheCartController.postPlaceOrder)
router.post('/checkout/walletpayment',sheCartController.postWalletPayment)

router.post('/checkout/verifycoupon',sheCartController.postVerifyToken)
router.get('/checkout/removecoupon',sheCartController.removeToken)



router.post('/checkout/cardpayment',cardpaymentController.getCardPayment)

router.get('/checkout/cardpayment/payagain/:orderid',cardpaymentController.getCardPaymentAfterFailure)
router.get('/checkout/cardpayment/success',cardpaymentController.getCardPaymentSuccess)
router.get('/checkout/cardpayment/failure',cardpaymentController.getCardPaymentFailure)





module.exports = router;