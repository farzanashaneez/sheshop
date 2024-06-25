const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;

  // check json web token exists & is verified
  if (token) {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.redirect('/admin_login');
      } else {
        console.log(decodedToken);
        next();
      }
    });
  } else {
    res.redirect('/admin_login');
  }
};

// check current user
const checkUser = (req, res, next) => {
  console.log('check user');
  const token = req.headers.token;
  if (token) {
    console.log('check user if yes');
    const token = token.split(' ')[1];
    jwt.verify(token,  process.env.ACCESS_TOKEN_SECRET, async (err, decodedToken) => {
      console.log(' check user verify token');
      if (err) {
        res.locals.user = null;
        next();
      } else {
        let user = await User.findById(decodedToken.id);
        res.locals.user = user;
        next();
      }
    });
  } else {
    console.log('check user if no');
    res.locals.user = null;
    
    next();
  }
};


module.exports = { requireAuth, checkUser };