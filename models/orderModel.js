const mongoose = require('mongoose');
const AddressSchema=require('./addressSchema')

const OrderSchema = new mongoose.Schema({
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
    ],
    totalamount: {
        type: Number,
        required: true
    },
    address: {
        type: AddressSchema,
        required: true
    },
    status: {
        type: String,
        default: "pending"
    }
},
    { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);