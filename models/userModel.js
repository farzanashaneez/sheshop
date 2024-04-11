const mongoose=require('mongoose')
const AddressSchema=require('./addressSchema')

const UserSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    address:{
        type:[AddressSchema],
        
    },
    password: {
        type: String,
        required: true
    }, 
    isAdmin: {
        type: Boolean,
        default: false
    },
    isBlock:{
        type: Boolean,
        default: false
    }
},
{ timestamps: true}
);

module.exports = mongoose.model('User', UserSchema);
