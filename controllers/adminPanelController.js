const Order=require('../models/orderModel')

const adminController={
    async get_dashboard(req,res){
       
      const [ordersChartList, topProducts, topcategory, topBrand] = await Promise.all([
        processOrdersData(),
        findTopProducts(),
        findTopCategory(),
        findTopBrand(),
      ]);


        if(res.locals.user)
        res.render('admin_panel',{ordersChartList,topProducts,topcategory,topBrand});
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

module.exports=adminController