const jwt =require('jsonwebtoken')
require('dotenv').config()
const User = require("../models/userModel");


/* jwt token verify */
const authenticationVerifier = (req, res, next)=> {
console.log(req.cookies)

    const authHeader = req.cookies.jwt;
    if (authHeader) {
        const token = req.cookies.jwt;

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,(err, user)=>{
            if(err) res.status(401).json("Invalid token");
          
           else
            next()
        })
    } else {
        return res.status(401).json("You are not authenticated");
    }
}

/* check if the current user */
const accessLevelVerifier = async (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
      try {
          const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
          const user = await User.findById(decodedToken.id);
          res.locals.user = user;
          next();

      } catch (err) {
          res.locals.user = null;
          res.status(403).json("You are not allowed to perform this task");

      }
  } else {
      res.locals.user = null;
      res.status(403).json("You are not allowed to perform this task");

  }
  
};

/* access_level_verifier('admin') */
// const isAdminVerifier = (req, res, next) => {
//     authenticationVerifier(req, res, ()=> {
//         if(req.user.isAdmin) {
//             next();
//         } else {
//             res.status(403).json("You are not allowed to perform this task")
//         }
//     })
// }

module.exports = { authenticationVerifier, accessLevelVerifier };