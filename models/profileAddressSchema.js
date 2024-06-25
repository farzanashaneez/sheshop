const mongoose = require("mongoose");

const profileAddressSchema = new mongoose.Schema(
  {
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
          type: Number,
          
        },
        phone:{
          type: Number,
        }
      }, 
  { timestamps: true }
);

module.exports = mongoose.model("UserAddress", profileAddressSchema);
