const express=require('express');
const router=express.Router();
const brandController=require('../../controllers/brandController.js')
const authMiddleware=require('../../middlewares/verifyToken')


const multer = require("multer")
const upload = require("../../helpers/multer.js")

const sharpHelper = require('../../helpers/sharp.js');


router.get('/',authMiddleware.authenticationVerifier,authMiddleware.accessLevelVerifier,brandController.get_brands);
//router.get('/:id',authMiddleware.accessLevelVerifier, brandController.get_category_by_id);
router.get('/update/:id', brandController.getEditBrand);
router.post('/update/:id',upload.single("myFile"),sharpHelper.resizeImage, brandController.postEditBrand);
router.get('/add', brandController.getAddBrand);
router.post('/add',upload.single("myFile"),sharpHelper.resizeImage, brandController.postAddBrand);
router.post('/delete/:id',authMiddleware.authenticationVerifier,brandController.postDeleteBrand);

module.exports=router;