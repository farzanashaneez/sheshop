const express = require('express');
const wishlistController = require('../../controllers/sheWishController');
const router = express.Router();
const checkblock=require('../../middlewares/checkBlockedUser')


router.get('/',checkblock.checkBlocked,wishlistController.getwishlist);
router.post('/removeProduct',wishlistController.postRemoveWishlist)


module.exports = router;