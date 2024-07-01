const Order=require('../models/orderModel')
const User=require("../models/userModel")

const adminController={
    async get_dashboard(req,res){
       
      const [ordersChartList, topProducts, topcategory, topBrand] = await Promise.all([
        processOrdersData(),
        findTopProducts(),
        findTopCategory(),
        findTopBrand(),
       
      ]);

      const statistic= await  findstatistics();
      console.log("statistic",statistic)
        if(res.locals.user)
        res.render('admin_panel',{ordersChartList,topProducts,topcategory,topBrand,statistic});
    else{
        res.redirect('/admin_login')
    }
    },
   
};
async function processOrdersData() {
    try {
      const ordersGroup = await Order.aggregate([
        {
            $match: {
                $or: [
                  { status: { $ne: "pending" } },
                  { $and: [
                    { paymentType: "COD" },
                    { $nor: [{ status: "cancelled" }, { status: "pending" }] }
                  ]}
                ]
              }
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              week: { $week: "$createdAt" }
            },
            total: { $sum: "$totalamount" }
          }
        },
        {
          $project: {
            _id: 0,
            year: "$_id.year",
            month: "$_id.month",
            week: "$_id.week",
            total: 1
          }
        }
      ]);
  
      const ordersData = ordersGroup.reduce((acc, order) => {
        if (!acc[order.year]) {
          acc[order.year] = {};
        }
  
        if (!acc[order.year][order.month]) {
          acc[order.year][order.month] = {};
        }
  
        acc[order.year][order.month][order.week] = order.total;
  
        return acc;
      }, {});
  
      return ordersData;
    } catch (err) {
      console.log(err);
    }
  }
  async function findTopProducts(){
    const totalSalesPerProduct = await Order.aggregate([
        { $unwind: "$products" },
        { $group: { _id: "$products.productid", totalSales: { $sum: "$products.quantity" } } },
        { 
          $lookup: {
            from: "products", 
            localField: "_id",
            foreignField: "_id",
            as: "productInfo"
          } 
        },
        { $unwind: "$productInfo" },
        { 
          $project: { 
            _id: 1, 
            totalSales: 1, 
            productName: "$productInfo.name" 
          } 
        },
        { $sort: { totalSales: -1 } },
  { $limit: 10 }
      ]);
      return totalSalesPerProduct
      
  }
  async function findTopCategory(){
    const topCategories = await Order.aggregate([
        { $unwind: "$products" }, 
        { 
          $lookup: {
            from: "products",
            localField: "products.productid",
            foreignField: "_id",
            as: "productInfo"
          } 
        },
        { $unwind: "$productInfo" },
        { 
          $group: { 
            _id: "$productInfo.category",
            totalSales: { $sum: "$products.quantity" } 
          } 
        },
        { $sort: { totalSales: -1 } },
        { $limit: 10 } 
      ]);
      console.log("topCategories",topCategories)
     return topCategories
      

  }
  async function findTopBrand(){
    const topBrands = await Order.aggregate([
        { $unwind: "$products" },
        { 
          $lookup: {
            from: "products",
            localField: "products.productid",
            foreignField: "_id",
            as: "productInfo"
          } 
        },
        { $unwind: "$productInfo" },
        { 
          $group: { 
            _id: "$productInfo.brand",
            totalSales: { $sum: "$products.quantity" }
          } 
        },
        { $sort: { totalSales: -1 } }, 
        { $limit: 10 } 
      ]);
      
      return topBrands
      
  }
  async function findstatistics(){
    try {
      // Calculate total sales (sum of payedamount of all orders)
      const totalSales = await Order.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: '$payedamount' }
          }
        }
      ]);
  
      // Count paid orders (orders not in 'pending' status)
      const paidOrders = await Order.countDocuments({ status: { $ne: 'pending' } });
  
      // Count new users (registered within a specific timeframe, e.g., last month)
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const newUsers = await User.countDocuments({ createdAt: { $gte: oneMonthAgo } });
  
      // Return the results
      return {
        totalSales: totalSales[0] ? totalSales[0].total : 0,
        paidOrders,
        newUsers
      };
    } catch (error) {
      console.error(error);
     // throw new Error('Error calculating sales data');
    }
  }

module.exports=adminController