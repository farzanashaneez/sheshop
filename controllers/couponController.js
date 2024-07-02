const Coupon=require('../models/couponModel')

const couponController={
    // async load_dashboard(req,res){
    //     const coupons=await Coupon.find({}).sort({createdOn:-1})
    //     res.render('coupons',{coupons});
    // },
    async load_dashboard(req, res) {
      try {
          const page = parseInt(req.query.page) || 1;
          const limit = parseInt(req.query.limit) || 3;
          const skip = (page - 1) * limit;
  
          const coupons = await Coupon.find()
              .sort({ createdOn: -1 })
              .skip(skip)
              .limit(limit);
  
          const totalCoupons = await Coupon.countDocuments();
          const totalPages = Math.ceil(totalCoupons / limit);
  
          res.render('coupons', {
              coupons,
              currentPage: page,
              totalPages,
              limit
          });
      } catch (err) {
          console.log("error", err);
      }
  },
  
    async postCoupon(req,res){
       const { name,
            createdOn,
            expireOn,
            offerPrice,
            minimumPrice,
            isList}=req.query;
        const newCoupon = new Coupon({
            name,
            createdOn,
            expireOn,
            offerPrice,
            minimumPrice,
            isList
          });
        
          try {
            const checkCouponexist=await Coupon.find({name:name})
           

            // Save the coupon to the database
            await newCoupon.save();
            res.status(200).json({ message: 'Coupon added successfully!' });
          } catch (error) {
            let message;
            if(checkCouponexist){
              message='coupon name already exits';
            }
            else{
              message= 'Failed to add coupon.'
            }
            res.status(500).json({ message, error });
          }
       // res.render('coupons');
    },
    async addCoupon(req,res){
       
        const { name,
            createdOn,
            expireOn,
            offerPrice,
            minimumPrice,
            isList}=req.body;
        const newCoupon = new Coupon({
            name,
            createdOn,
            expireOn,
            offerPrice,
            minimumPrice,
            isList
          });
          let message,isvalid;
          try {
            const checkCouponexist=await Coupon.find({name:name})
            
            if(checkCouponexist){
              message='coupon name already exits';
              isvalid=false;
            }
            else{
              message= 'Failed to add coupon.'
              isvalid=true;

            }
          
              await newCoupon.save();
           
            res.status(200).json({ message: 'Coupon added successfully!',isvalid});
          } catch (error) {
           
            res.status(500).json({ message,isvalid, error });
                    }
       // res.render('coupons');
    },
    async removecoupon(req,res){
       
        const couponId = req.params.couponId;

        try {
            await Coupon.findByIdAndDelete(couponId);
            res.status(200).json({ message: 'Coupon deleted successfully!' });
          } catch (error) {
            res.status(500).json({ message: 'Failed to delete coupon.', error });
          }
    }
};
module.exports=couponController