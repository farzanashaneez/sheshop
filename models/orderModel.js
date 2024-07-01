const mongoose = require('mongoose');
const AddressSchema=require('./addressSchema');
const { bool } = require('sharp');

const OrderSchema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
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
                
            },
            isreturned:{
                type:Boolean,
                default:false
            }
        }
    ],
    orderid: {
        type: String,
        required: true
    },
    totalamount: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        required: true
    },
    payedamount: {
        type: Number,
        required: true
    },
    address: {
        type: AddressSchema,
        required: true
    },
    status: {
        type: String,
        default: "processing"
    },
    paymentType:{
        type: String,
        default: "COD"
    },
    

},
    { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);