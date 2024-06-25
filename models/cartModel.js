
const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    products: [

        {
            productid: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
            },
            quantity: {
                type: Number,
                default: 1
            },
            price: {
                type: Number,
                
            }
        }
    ],
    couponid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon',
    },
},
    

    { timestamps: true }
);
//CartSchema.path('products').default([{productid:"",quantity:0}]);

module.exports = mongoose.model('Cart', CartSchema);