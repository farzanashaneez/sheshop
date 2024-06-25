const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    products: [
        { productid: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
            }
        }
    ]},

    { timestamps: true }
);

module.exports = mongoose.model('Wishlist', wishlistSchema);