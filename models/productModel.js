const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: Array,
        required: true
    },
    categoryid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    brandid:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand'
    },
    quantity: {
        type: Number
    },
    option: {
        type: Array
    },
    price: {
        type: Number,
        required: true
    }
},
    { timestamps: true }
);

module.exports = mongoose.model('Product', ProductSchema);