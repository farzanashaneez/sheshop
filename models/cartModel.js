const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [
        {
            productid: {
                type: mongoose.Schema.Types.ObjectId
            },
            quantity: {
                type: Number,
                default: 1
            }
        }
    ]},

    { timestamps: true }
);

module.exports = mongoose.model('Cart', CartSchema);