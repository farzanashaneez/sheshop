const categoryModel = require("../models/categoryModel");
const Product=require("../models/productModel");
const fs = require("fs");
const path = require("path");

const categoryController = {
  async get_categories(req, res) {
    try {
      const categories = await categoryModel.find({});
      categoryArray = categories;
      res.render("categories", { categories: categories });
    } catch (err) {
      console.log(err)
    }
  },
  async getEditCategory(req, res) {
    try {
      const id = req.params.id;
      const category = await categoryModel.findOne({ _id: id });
      res.render("categoryupdate", { category: category });
    } catch (error) {
      console.log(error.message);
      res.render('frontend/error',{title:"Error",message:"Category Not found"})

    }
  },
  async postEditCategory(req, res) {
    try {
      
      const id = req.params.id;
      const { categoryName, description } = req.body;
      const findCategory = await categoryModel.find({ _id: id });
      


    let image = req.file ? req.file.filename : findCategory.categoryimage;

    const updatedCategory = await categoryModel.findByIdAndUpdate(
        id,
        { categoryname: categoryName, categorydescription: description, categoryimage: image },
        { new: true } // To return the updated document
    );

    if (!updatedCategory) {
        throw new Error("Category not found");
    }

    res.redirect("/admin/categories");
} catch (error) {
    console.error(error);
    // Handle the error appropriately
   // res.status(500).send("Error updating category");
    res.render('frontend/error',{title:"error 500",message:"Error updating category"})

}
  },
  async postDeleteCategory(req, res) {
    try {
      const id = req.params.id;
      const deletedCategory = await categoryModel.findByIdAndDelete(id);

      if (deletedCategory) {
        res.redirect("/admin/categories");
      } else {
        res.redirect("/admin/categories");
      }
    } catch (error) {
      res.render('frontend/error',{title:"error 500",message:"Error deleting category"})

      
    }
  },

  getAddCategory(req, res) {
    res.render("categoryadd");
  },
 
  async postAddCategory(req, res) {
    try {
      const { categoryName, categorydescription, categoryoptions } = req.body;
      let categoryOptionArray = [];
      if (categoryoptions) categoryOptionArray = categoryoptions.split(",");

     

      const categoryExists = await categoryModel.findOne({
        categoryname: categoryName,
      });
      let newCategory;
      if (!categoryExists) {
        newCategory = new categoryModel({
          categoryname: categoryName,
          categorydescription: categorydescription,
          categoryimage: req.file.filename,
          categoryoptions: categoryOptionArray,
        });

        try {
          
          const saved = await newCategory.save();
          res.redirect("/admin/categories");
        } catch (error) {
         
          res.json({ error: error.message });
        }
      } else {
      
        
        res.send("category exist");
      }
    } catch (error) { 
      console.log("error",error)
      res.redirect("/admin/categories");
    }
  },
  async postApplyOffer(req,res){
  
    try{  

  const category = await categoryModel.findById(req.body.categoryIds[0])
   category.categoryofferpercentage=parseInt(req.body.offerPercentage)
   await category.save();

   const products=await Product.find({category:category.categoryname})
   for (const product of products) {
    product.offerpercentage = req.body.offerPercentage;
    product.price=product.regularprice-(product.regularprice*req.body.offerPercentage/100);
    await product.save();
   }
   res.json({message:"offer applied successfully"})
  }
  catch(err){
    res.status(404).json({err})

  }

}
};

module.exports = categoryController;
