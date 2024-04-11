const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    rating: {
      type:mongoose.Schema.Types.Decimal128 ,
      required: true,
      min: 0,
      max: 5
    },
    comment: {
      type: String,
      required: true
    }
    },
    { timestamps: true }
);



module.exports = mongoose.model('Review', ReviewSchema);