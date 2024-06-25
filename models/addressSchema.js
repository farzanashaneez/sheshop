const mongoose=require('mongoose')

const AddressSchema = new mongoose.Schema({
  house: {
    type: String,
    
  },
    street: {
      type: String,
      
    },
    city: {
      type: String,
      
    },
    state: {
      type: String,
      
    },
    zipcode: {
      type: String,
      
    },
    phone:{
      type: Number,
    }
  }, { _id: false });
  module.exports=AddressSchema