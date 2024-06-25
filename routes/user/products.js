const express = require('express');
const sheproductController = require('../../controllers/sheHomeProductController');
const router = express.Router();

router.get('/',sheproductController.getProducts);
router.post('/cart/:id',sheproductController.postProductToCArt);
router.post('/wishlist/add/:id',sheproductController.postProductToWishlist);
router.post('/wishlist/remove/:id',sheproductController.postRemoveProductFromWishlist);

router.get('/productdetails/:id',sheproductController.getProductdetails)

router.get('/search',sheproductController.getSearchProduct)
router.post('/searchby', sheproductController.postSearchProduct);


module.exports = router;