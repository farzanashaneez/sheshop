const passport = require("passport");
const User = require("../models/userModel");
const crypto=require("crypto") 

const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:process.env.CALLBACK_URL,
    passReqToCallback:true,
    scope:["profile","email"]
  },
  async function(request, accessToken, refreshToken, profile, done) {
    try {
      console.log("profile",profile)
        let user = await User.findOne({ googleId: profile.id });
        let regisuser=await User.findOne({ email: profile.emails[0].value });

        if (!user&&!regisuser) {
          const referalCode=crypto.randomBytes(3).toString('hex');

            user = new User({
                googleId: profile.id,
                firstname: profile.displayName,
                email: profile.emails[0].value,
                referalCode
            });
            await user.save();
            console.log("user",user)

          }
            else if(regisuser){
              console.log("save reguser",regisuser)
  
              regisuser.googleId=profile.id;
              await regisuser.save();
              return done(null, regisuser);

            }
         return done(null, user);
    } catch (err) {
        console.log("passport error",err)
        return done(err);
    }
  }
));

passport.serializeUser(function(user, done) {
    console.log("serializer user",user);

  done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
    try {
        const user = await User.findById(id);
        done(null, user);
      } catch (err) {
        done(err);
      }
});


//module.exports = passport;