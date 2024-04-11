const mongoose = require('mongoose');

const BrandSchema = new mongoose.Schema({
    brandname:{
        type:String,
        required:true
    },
    brandimage: {
        type: String,
        required:true
    }
},
    { timestamps: true }
);

module.exports = mongoose.model('Brand', BrandSchema);