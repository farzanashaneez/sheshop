const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const path = require("path");
const fs = require("fs");
const PDFDocument = require("../helpers/pdfkit-tables");


//const excel = require('excel4node');
const ExcelJS = require("exceljs")


const reportController = {
  // async load_dashboard(req, res) {
  //   try {
  //     const Orders = await Order.find({})
  //       .sort({ createdAt: -1 })
  //       .populate("userid") // Populate userid reference
  //       .populate("products.productid"); // Populate productid references within products array

  //     console.log(Orders);

  //     res.render("reports", { Orders });
  //   } catch (err) {
  //     console.log("error", err);
  //   }
  // },
  async load_dashboard(req, res) {
    try {
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 10; 

        const skip = (page - 1) * limit;

        const Orders = await Order.find({})
            .sort({ createdAt: -1 })
            .populate("userid")
            .populate("products.productid") 
            .skip(skip)
            .limit(limit);

        const totalOrders = await Order.countDocuments({});

        const totalPages = Math.ceil(totalOrders / limit);

        res.render("reports", {
            Orders,
            currentPage: page,
            totalPages,
            limit
        });
    } catch (err) {
        console.log("error", err);
        res.status(500).send("An error occurred");
    }
}
,

  async generateReport(req, res) {
    try {
        console.log("ordersGroup body",req.body);
      const filename = "sales-report.pdf";
      const doc = new PDFDocument();

      let ordersGroup;

        if(req.body.datefilter==='daily'){
            ordersGroup = await Order.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt",timezone: "Asia/Dubai" } },
                    orders: { $push: "$$ROOT" },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 } // Sort by day
            }
        ]);
    }
    else if(req.body.datefilter==='weekly'){
        ordersGroup = await Order.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        week: { $week: "$createdAt" }
                    },
                    orders: { $push: "$$ROOT" },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.week": 1 } // Sort by year and week
            }
        ]);
    }
    else if(req.body.datefilter==='monthly'){
        ordersGroup = await Order.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    orders: { $push: "$$ROOT" },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]);
    }
    else if(req.body.datefilter==='custom'){
        const orderAtCustomDate = await Order.find({
            createdAt: {
                $gte: new Date(req.body.startdate), // Filter orders created on or after the startDate
                $lte: new Date(req.body.enddate) // Filter orders created on or before the endDate
            }
        }).exec();
        ordersGroup=[{_id:`${req.body.startdate}-${req.body.enddate}`,orders:orderAtCustomDate}]
    }


      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
      doc.pipe(res);
      const imagePath = path.join(
        __dirname,
        "..",
        "public",
        "images",
        "She Shop.png"
      );
      doc
      .image(imagePath, 50, 45, { width: 150 })
      .fillColor("#444444")
      .fontSize(20)
      .text("Sales Report", 10, 57,{ align:'center' })
      .fontSize(10)
      .text(`created At:${new Date().toDateString()}`, 200, 65, { align: "right" })
      .moveDown(5);
    
    
    for (const data of ordersGroup) {
        doc
        .fillColor("#444444")
        .fontSize(14)
        .text(`Ordered-at ${data._id}`, 50,  doc.y,{ align:'center' })
        .moveDown(1);

      const table = {
        headers: [
          "Order id",
          "Order date",
          "User name",
          "Phone number",
          "Total Price",
          "Discount",
          "Total Payed",
          "Payment Method",
          "Order status",
        ],
        rows: [],
      };
      let totalSales = 0;
      let totalDiscount = 0;
      let totalRevenue = 0;
    
      // Add the patients to the table
      for (const item of data.orders) {
        table.rows.push([
          item._id,
          new Date(item.createdAt).toLocaleString(),
          item.userid?.firstname,
          item.address.phone,
          item.totalamount,
          item.discount,
          item.payedamount,
          item.paymentType,
          item.status,
        ]);
        totalSales += item.totalamount;
        totalDiscount += item.discount;
        totalRevenue += item.payedamount;
      }
    
      // Draw the table
      doc.table(table, 10, doc.y, { width: 590, prepareHeader: () => doc.font('Helvetica-Bold'), prepareRow: (row, i) => doc.font('Helvetica').fontSize(10) });
    
      // Calculate the height of the table
      const tableHeight = (table.rows.length + 1) * 20;
    
      // Move the y-position to the bottom of the table
      doc.y += tableHeight + 10;
    
      // Move the y-position back to the bottom of the table for the total price area
      doc.y -= tableHeight;
    
      // Draw the total price area
      doc
        .fillColor("#444444")
        .fontSize(12)
        .text("Total Sales: $" + totalSales.toFixed(2), 10, doc.y + 10, { align: 'right' })
        .text("Total Discount: $" + totalDiscount.toFixed(2), 10, doc.y + 10, { align: 'right' })
        .text("Total Revenue: $" + totalRevenue.toFixed(2), 10, doc.y + 10, { align: 'right' });
    
      doc.moveDown();
    }
    
    doc.end();

    } catch (err) {
      console.log("error", err);
    }
  },

async generateExcelReport(req, res) {
  let ordersGroup;
  console.log("in generateExcelReport");
  ordersGroup = await Order.find().limit(100).sort({createdAt:-1})
  .populate("userid")

  const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');

        worksheet.columns = [
            { header: 'Order ID', key: 'orderId', width: 50 },
            { header: 'Customer', key: 'customer', width: 30 },
            { header: 'Date', key: 'date', width: 30 },
            { header: 'Total', key: 'totalAmount', width: 15 },
            { header: 'Payed Amount', key: 'payment', width: 15 },
        ];

       

        ordersGroup.forEach(order => {
            worksheet.addRow({
                orderId: order.orderid,
                customer:order.userid?.firstname || "",
                date: new Date(order.createdAt).toLocaleString(),
                totalAmount: order.totalamount,
                payment:order.paymentType || "",
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=salesReport.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
}


};
module.exports = reportController;
