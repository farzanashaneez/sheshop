const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
  name : {
    type : String,
    required : true,
    unique : true
},
createdOn : {
    type : Date,
    required : true
},
expireOn : {
    type : Date,
    required : true
},
offerPrice : {
    type : Number,
    required : true
},
minimumPrice : {
    type : Number,
    required : true
},
isList : {
    type : Boolean,
    default : true
},
userId: {
    type: [String] // This specifies an array of strings
  }
});

module.exports = mongoose.model('Coupon', CouponSchema);