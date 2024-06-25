const express=require('express');
const router=express.Router();
const reportController=require('../../controllers/reportController')
const authMiddleware=require('../../middlewares/verifyToken')

router.get('/',authMiddleware.authenticationVerifier,reportController.load_dashboard);

router.post('/generate-report',authMiddleware.authenticationVerifier,reportController.generateReport);
router.get('/generateexcelreport',authMiddleware.authenticationVerifier,reportController.generateExcelReport);


module.exports=router;