const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [
        { productid: {
                type: mongoose.Schema.Types.ObjectId,
            }
        }
    ]},

    { timestamps: true }
);

module.exports = mongoose.model('Wishlist', wishlistSchema);