const brandModel = require("../models/brandModel");
const fs = require('fs');
const path = require('path');


const brandController = {
  async get_brands(req, res) {
    try {
      const brands = await brandModel.find({});
      brandArray = brands;
      res.render("brand", { brands: brands });
    } catch (err) {
     res.render('frontend/error',{title:"error 500",message:err.message})

    }
  },
  async getEditBrand(req, res) {
    try {
      const id = req.params.id;
      const brand = await brandModel.findById(id)
     
      res.render("brandupdate", { brand: brand });
    } catch (error) {
      console.log(error.message);
      res.render('frontend/error',{title:"Error",message:"Page Not found"})

    }
  },
  async postEditBrand(req, res) {
    try {
      console.log("in posdt edit brand")
      const id = req.params.id;
      const { brandname } = req.body;
      const findBrand = await brandModel.find({ _id: id });


      let image = req.file ? req.file.filename : findBrand.categoryimage;
      const updatedBrand = await brandModel.findByIdAndUpdate(
        id,
        {
          brandname: brandname,
          brandimage:image
        },
        { new: true } // To return the updated document
    );

    if (!updatedBrand) {
      throw new Error("Category not found");
  }
  else{
        res.redirect("/admin/brands");
  }
     
    } catch (error) { 
      console.log(error.message);

      //res.status(500).send("Error updating brand");

    }
  },
  async postDeleteBrand(req, res) {
    try {
      const id = req.params.id;
      const deletedCategory = await brandModel.findByIdAndDelete(id);
  
      if (deletedCategory) {
        res.redirect("/admin/brands");
      } else {
        res.redirect("/admin/brands");
      }
    } catch (error) {
     
     res.render('frontend/error',{title:"error 500",message:"Internal server error"})

      
    }
  },
  getAddBrand(req, res) {
    res.render("brandadd");
  },

  async postAddBrand(req, res) {
    try {
      const { brandname } = req.body
     


      const brandExists = await brandModel.findOne({ brandname:brandname })
     
          if (!brandExists) {
              const newbrand = new brandModel({
                brandname: brandname,
                brandimage:req.file.filename
              })
              await newbrand.save()
              res.redirect("/admin/brands")
          } else {
              res.redirect("/admin/brands/add")
          }
     
  } catch (error) {
      console.log("error message",error.message);
  }
  },
};

module.exports = brandController;
