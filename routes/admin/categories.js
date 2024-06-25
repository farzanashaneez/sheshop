const express=require('express');
const router=express.Router();
const categoryController=require('../../controllers/categoriesController')
const authMiddleware=require('../../middlewares/verifyToken')


const multer = require("multer")
const upload = require("../../helpers/multer.js")

const sharpHelper = require('../../helpers/sharp.js');


router.get('/',authMiddleware.authenticationVerifier,categoryController.get_categories);
//router.get('/:id',authMiddleware.accessLevelVerifier, categoryController.get_category_by_id);
router.get('/update/:id', categoryController.getEditCategory);
router.post('/update/:id',upload.single("myFile"),sharpHelper.resizeImage, categoryController.postEditCategory);
router.get('/add', categoryController.getAddCategory);

router.post('/add',upload.single("myFile"),sharpHelper.resizeImage, categoryController.postAddCategory);

router.post('/delete/:id',authMiddleware.authenticationVerifier,categoryController.postDeleteCategory);

router.post('/apply-offer',authMiddleware.authenticationVerifier,categoryController.postApplyOffer);

module.exports=router;