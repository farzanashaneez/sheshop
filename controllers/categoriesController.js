const categoryModel = require("../models/categoryModel");
const Product = require("../models/productModel");
const fs = require("fs");
const path = require("path");
const HTTP_STATUS = require('../utils/httpStatus'); 

const categoryController = {
  async get_categories(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const categories = await categoryModel.find({}).skip(skip).limit(limit);

      const totalCategories = await categoryModel.countDocuments();
      const totalPages = Math.ceil(totalCategories / limit);

      res.status(HTTP_STATUS.OK).render("categories", {
        categories,
        currentPage: page,
        totalPages,
        limit,
      });
    } catch (err) {
      console.log(err);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: err.message });
    }
  },

  async getEditCategory(req, res) {
    try {
      const id = req.params.id;
      const category = await categoryModel.findOne({ _id: id });
      res
        .status(HTTP_STATUS.OK)
        .render("categoryupdate", { category: category });
    } catch (error) {
      console.log(error.message);
      res
        .status(HTTP_STATUS.NOT_FOUND)
        .render("frontend/error", {
          title: "Error",
          message: "Category Not found",
        });
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
        {
          categoryname: categoryName,
          categorydescription: description,
          categoryimage: image,
        },
        { new: true } // To return the updated document
      );

      if (!updatedCategory) {
        throw new Error("Category not found");
      }

      res.redirect("/admin/categories");
    } catch (error) {
      if (!res.headersSent) {
        res
          .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
          .render("frontend/error", { message: "Error editing category" });
      }
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
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .render("frontend/error", {
          title: "error 500",
          message: "Error deleting category",
        });
    }
  },

  getAddCategory(req, res) {
    res.status(HTTP_STATUS.OK).render("categoryadd");
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
        res.status(HTTP_STATUS.CONFLICT).send("category exist");
      }
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).redirect("/admin/categories");
    }
  },
  async postApplyOffer(req, res) {
    try {
      const category = await categoryModel.findById(req.body.categoryIds[0]);
      category.categoryofferpercentage = parseInt(req.body.offerPercentage);
      await category.save();

      const products = await Product.find({ category: category.categoryname });
      for (const product of products) {
        product.offerpercentage = req.body.offerPercentage;
        product.price =
          product.regularprice -
          (product.regularprice * req.body.offerPercentage) / 100;
        await product.save();
      }
      res.status(HTTP_STATUS.OK).json({ message: "offer applied successfully" });
    } catch (err) {
      res.status(HTTP_STATUS.NOT_FOUND).json({ err });
    }
  },
};

module.exports = categoryController;
