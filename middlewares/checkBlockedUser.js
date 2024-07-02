const User = require("../models/userModel");


/* jwt token verify */
const checkBlocked =async (req, res, next)=> {

   try{
    if (req.session && req.session.userid) {
const user=await User.findById(req.session.userid)
if(user.isBlock){
    return     res.render('frontend/error',{title:"Blocked User",message:"you are blocked"})

}
else{
    next();
}
    }
    else{
next();
    }
   }
   catch(e){
    res.render('frontend/error',{title:e.message,message:e.message})

   }
}
module.exports = { checkBlocked };