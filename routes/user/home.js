const express=require('express');
const router=express.Router();
const homeController=require('../../controllers/sheHomeController')
const passport = require('../../middlewares/googlepassport');


router.get('/',homeController.getHome);

router.post('/signin',homeController.postSignin)
router.get('/logout',homeController.getLogout)
//router.post('/register',homeController.postRegister)

router.get('/auth/google',homeController.getGoogleLogin);
router.get('/auth/google/callback', homeController.getGoogleCallback);
module.exports=router;