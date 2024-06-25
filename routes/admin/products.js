const express=require('express');
const router=express.Router();
const productController=require('../../controllers/productsController')
//const { isAdminVerifier,authenticationVerifier,accessLevelVerifier } = require('../../middlewares/verifyToken');
const authMiddleware=require('../../middlewares/verifyToken')

const multer = require("multer")
const upload = require("../../helpers/multer.js")
const sharpHelper = require('../../helpers/sharp.js');

router.get('/',authMiddleware.authenticationVerifier, productController.get_products);
router.get('/add',authMiddleware.authenticationVerifier, productController.getaddProduct);
router.post('/add',authMiddleware.authenticationVerifier, upload.array("myFile", 5),productController.postaddProduct);
router.get('/update/:id',authMiddleware.authenticationVerifier, productController.getUdateProducts);
router.post('/update/:id',authMiddleware.authenticationVerifier,upload.array("myFile", 5), productController.postUdateProducts);
router.post('/delete/:id',authMiddleware.authenticationVerifier, productController.postDeleteproduct);

router.post('/apply-offer',authMiddleware.authenticationVerifier,productController.postApplyOffer);

module.exports=router;







