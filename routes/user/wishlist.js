const express = require('express');
const wishlistController = require('../../controllers/sheWishController');
const router = express.Router();

router.get('/',wishlistController.getwishlist);
router.post('/removeProduct',wishlistController.postRemoveWishlist)


module.exports = router;