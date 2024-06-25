const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    categoryname:{
        type:String,
        required:true
    },
    categorydescription:{
        type:String
    },
    categoryoptions:{
        type:Array
    },
    categoryimage: {
        type: String,
        required:true
    },
    categoryofferpercentage:{
        type:Number
    },

},
    { timestamps: true }
);

module.exports = mongoose.model('Category', CategorySchema);