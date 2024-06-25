const express = require('express');
const sheProfileController = require('../../controllers/sheProfileController');
const router = express.Router();

router.get('/',sheProfileController.getProfile);
router.post('/',sheProfileController.postProfile)
//router.post('/address/:type',sheProfileController.postAddress)
//router.get('/removeaddress',sheProfileController.postDeleteAdd ress)

router.get('/address',sheProfileController.getUseraddress);
router.post('/address',sheProfileController.postUserddress);
router.post('/address/edit/:index',sheProfileController.editUserddress);
router.post('/address/remove/:index',sheProfileController.deleteUserddress);

router.get('/cancelorder/:orderid',sheProfileController.getcancelOrder);
router.get('/getinvoice/:orderid',sheProfileController.getinvoice);
router.get('/downloadinvoice/:orderid',sheProfileController.generateInvoiceReport);









module.exports = router;