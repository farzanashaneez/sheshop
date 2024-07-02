
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const session = require('express-session');
//const cookieSession = require('cookie-session');
const nocache = require("nocache")
const passport = require('passport');
const passportsetup = require('./middlewares/googlepassport');
const Order=require('./models/orderModel')



//stripe integration
require('dotenv').config()
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)



var path = require('path');

const app = express();

/* configure body-parser */
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())

app.use(session({
    secret: 'secret',
    resave:true,
    saveUninitialized: true,
}))


app.use(passport.initialize());
app.use(passport.session());



app.use((req, res, next) => {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
});

app.use(nocache())
app.use(errorHandler);

// session for client side


/* configure view engine */
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.set('trust proxy', 1);
// 
const routes = require('./routes');
app.use(routes)


app.get('/logout',(req,res)=>{
    
  res.locals.user=null;
  res.cookie('jwt', '', { maxAge: 1 });
      res.redirect('/admin_login');

  });
app.get('*',(req,res)=>{
  //res.status(404).send('404 - Page not found');
  res.render('frontend/error',{title:"error 404",message:"Page Not Found"})


})

   

    const endpointSecret = "whsec_9b03b780e04a2e818d45b947e7735b801b3e05e19e84049a9a6a617f073a1a58";

app.post('/stripe-webhook', express.raw({type: 'application/json'}), (request, response) => {
    console.log("triggered")
  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntentSucceeded = event.data.object;
      // Then define and call a function to handle the event payment_intent.succeeded
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  response.send();
});

function errorHandler(err, req, res, next) {
  console.error(err.stack);  
  res.render('frontend/error',{title:"error 500",message:err.message})

}

/* connecting to the database */
mongoose.connect(process.env.MONGODB_URL)
.then(() => {
    console.log("Successfully connected to the database");
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});




/* listen for requests */
app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});
