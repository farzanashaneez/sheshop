const mongoose = require("mongoose");
const { ObjectId } = require("mongoose").Types;

const Brand = require("../models/brandModel");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const User = require("../models/userModel");
const Cart = require("../models/cartModel");
const Wishlist = require("../models/wishListModel");

const productController = {
  async getProducts(req, res) {
    console.log("@home.sessn..", req.session);
    console.log("@home.user..", req.user);
    if (req.isAuthenticated()) {
      req.session.userid = req.session.passport.user;
      console.log("ys authenticated");
    } else console.log("not authenticated");

    try {
    //   const [categoryData, brandData, productData] = await Promise.all([
    //     Category.find({}),
    //     Brand.find({}),
    //     Product.find().sort({ id: -1 })
    // ]);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const [categoryData, brandData, productData, totalProducts] = await Promise.all([
        Category.find({}),
        Brand.find({}),
        Product.find().sort({ id: -1 }).skip(skip).limit(limit),
        Product.countDocuments()
    ]);

    const totalPages = Math.ceil(totalProducts / limit);

    
      let data;
      let minPrice = 0;
      let maxPrice = 0;
      let cartArray = [];
      let cart;
      if (req.session && req.session.userid) {
        console.log("req.session.userid", req.session.userid);

        const [userData, wishlist] = await Promise.all([
          User.findById(req.session.userid),
          Wishlist.findOne({ userid: req.session.userid })
      ]);
      
        let productids = [];
        let updatedCart = [];
        let subtotal = 0;

        if (wishlist) {
          productids = wishlist.products.map((items) =>
            items.productid.toString()
          );
          console.log("wishlist product array", productids);
        }

        const result = await Product.aggregate([
          {
            $group: {
              _id: null,
              minPrice: { $min: "$price" },
              maxPrice: { $max: "$price" },
            },
          },
        ]);

        if (result.length > 0) {
          minPrice = result[0].minPrice;
          maxPrice = result[0].maxPrice;
        }
        cart = await Cart.findOne({ userid: req.session.userid });

        if (cart) {
          await cart.populate("products.productid");
          console.log("populated", cart);
          updatedCart = cart.products.map((item) => {
            const productTotal = item.productid.price * item.quantity || 0;
            return {
              _id: item.productid._id,
              name: item.productid.name,
              brand: item.productid.brand,
              category: item.productid.category,
              description: item.productid.description,
              image: item.productid.image,
              productcount: item.productid.quantity,
              quantity: item.quantity,
              volume: item.productid.volume,
              color: item.productid.color,
              price: item.productid.price,
              ratings: item.productid.ratings,
              updatedAt: item.productid.updatedAt,
              totalAmount: productTotal,
            };
          });

          subtotal = updatedCart.reduce(
            (total, item) => total + item.totalAmount,
            0
          );
        }

        data = {
          categoryData: categoryData,
          brandData: brandData,
          productData: productData,
          userData: userData,
          cartData: updatedCart,
          userWishlist: productids,
          wishcount: productids.length,
          minPrice,
          maxPrice,
          subtotal,
          currentPage: page,
            totalPages,
            limit,
            totalProducts
        };
      } else {
        data = {
          categoryData: categoryData,
          brandData: brandData,
          productData: productData,
          currentPage: page,
            totalPages,
            limit,
            totalProducts,
          minPrice,
          maxPrice,
        };
      }
      res.render("frontend/sheproducts", data);
    } catch (error) {
      console.log(error.message);
    }
  },

  async postProductToCArt(req, res) {
    console.log("req.params.quantity", req.body.quantity);
    //res.send({ message: 'Product added to cart' });
    try {
      if (req.session && req.session.userid) {
        const productId = req.params.id;
        const userId = req.session.userid;
        let message = "";
        const quantitybody = parseInt(req.body.quantity) || 1;
        console.log("quantity body ", req.body.quantity);

        const product = await Product.findById({ _id: productId });
        if (!product) {
          return res.status(404).send({ message: "Product not found" });
        }

        let cart = await Cart.findOne({ userid: req.session.userid });
        if (!cart) {
          // Create a new cart for the user
          cart = new Cart({ userid: userId, products: [] });
          await cart.save();
        }

        const productIndex = cart.products.findIndex(
          (item) => item.productid.toString() === product._id.toString()
        );
        if (productIndex !== -1) {
          cart.products[productIndex].quantity += quantitybody;
        } else {
          cart.products.push({
            productid: product._id,
            quantity: 1,
            price:product.price
          });
        }
        if (product.quantity >= quantitybody) {
          await cart.save();
          product.quantity -= quantitybody;
          await product.save();
          message = "Product added to cart successfully";
        } else {
          if (product.quantity === 0)
            message = "Out of stock...!\n please come again later";
          else
            message = `Oops! We only have ${product.quantity} items left in stock. Please adjust your order to ${product.quantity} or fewer.`;
        }

        res.send({ message: message });
      } else {
        console.log("message");

        res.send({ message: "Only Logged users can purchase our products" });
      }
    } catch (err) {
      console.log("err", err);

      res.send(err);
    }
  },
  async postProductToWishlist(req, res) {
    console.log("add wishlist", req.params);
    try {
      if (req.session && req.session.userid) {
        const productId = req.params.id;
        console.log("req.params.id", req.params.id);
        const userId = req.session.userid;

        const product = await Product.findById({ _id: productId });
        if (!product) {
          return res.status(404).send({ message: "Product not found" });
        }

        let wishlist = await Wishlist.findOne({ userid: req.session.userid });
        if (!wishlist) {
          // Create a new cart for the user
          wishlist = new Wishlist({ userid: userId, products: [] });
          await wishlist.save();
        }

        wishlist.products.push({ productid: product._id });
        await wishlist.save();

        console.log("Product added to wishlist successfully");
        res.json({ islogged: true, inWishlist: true });
      } else {
        console.log("message");

        res.send({
          islogged: false,
          message: "Only Logged users can add or remove wishlist",
        });
      }
    } catch (err) {
      //res.send({ err });
      res.render('frontend/error',{title:"Error",message:"not found"})

    }
  },

  async postRemoveProductFromWishlist(req, res) {
    console.log("remove wishlist", req.params);
    try {
      if (req.session && req.session.userid) {
        const productId = req.params.id;
        console.log("req.session.userid", req.session.userid);
        let wishlist = await Wishlist.findOne({ userid: req.session.userid });

        console.log("wishlist.products", wishlist.products);
        console.log("productId", productId);
        const cartIndex = wishlist.products.findIndex(
          (item) => item.productid.toString() === productId
        );
        wishlist.products.splice(cartIndex, 1);
        await wishlist.save();

        console.log("Product removed from wishlist successfully");
        res.send({ islogged: true, inWishlist: false });
      } else {
        res.send({
          islogged: false,
          message: "Only Logged users can add or remove wishlist",
        });
      }
    } catch (err) {
      //res.send({ err });
      res.render('frontend/error',{title:"Error",message:"not found"})

    }
  },
  async getProductdetails(req, res) {
    let data;
    try {
      const [productData, categoryData, userData] = await Promise.all([
        Product.findById(req.params.id),
        Category.find({}),
        User.findById(req.session.userid)
    ]);
    

      const similarProducts = await Product.find({
        category: productData.category,
        _id: { $ne: productData._id },
      }).limit(5);

      

      let updatedCart = [];

      if (req.session && req.session.userid) {
        let cart;
        let subtotal = 0;
        let updatedCart = [];

        cart = await Cart.findOne({ userid: req.session.userid });
        if (cart) {
          await cart.populate("products.productid");
          console.log("populated", cart);
          updatedCart = cart.products.map((item) => {
            const productTotal = item.productid.price * item.quantity || 0;
            return {
              _id: item.productid._id,
              name: item.productid.name,
              brand: item.productid.brand,
              category: item.productid.category,
              description: item.productid.description,
              image: item.productid.image,
              productcount: item.productid.quantity,
              quantity: item.quantity,
              volume: item.productid.volume,
              color: item.productid.color,
              price: item.productid.price,
              ratings: item.productid.ratings,
              updatedAt: item.productid.updatedAt,
              totalAmount: productTotal,
            };
          });

          const subtotal = updatedCart.reduce(
            (total, item) => total + item.totalAmount,
            0
          );
        }
        const shippingcharge = 20;
        const wishlist = await Wishlist.findOne({ userid: req.session.userid });
        let isWishlist = false;
        if (wishlist) {
          const productids = wishlist.products.map((items) =>
            items.productid.toString()
          );
          isWishlist = productids.includes(req.params.id);
          console.log("is wishlist", isWishlist);
        }
        data = {
          cartData: updatedCart,
          userData: userData,
          productData: productData,
          similarProducts,
          categoryData: categoryData,
          isWishlist: isWishlist,
          wishcount: wishlist.products?.length || 0,
          subtotal,
        };
      } else {
        data = {
          productData: productData,
          similarProducts,
          categoryData: categoryData,
        };
      }

      //res.render('frontend/productDetails',data)
      res.render("frontend/productdetails", data);
    } catch (error) {
     // res.send({ error });
     res.render('frontend/error',{title:"Error",message:"product not found"})

      console.log(error.message);
    }
  },

  async getSearchProduct(req, res) {
    const {
      category,
      brand,
      categories,
      brands,
      reqminPrice,
      reqmaxPrice,
      sort_by,
    } = req.query;

    if (req.isAuthenticated()) {
      req.session.userid = req.session.passport.user;
      console.log("ys authenticated");
    } else console.log("not authenticated");

    let data;
    let minPrice = 0;
    let maxPrice = 0;
    let cartArray = [];
    let cart;
    try {
      let query = {};

      if (category) {
        query.category = category;
      }

      if (brand) {
        query.brand = brand;
      }

      if (categories && brands) {
        query.$or = [
          { category: { $in: categories.split(",") } },
          { brand: { $in: brands.split(",") } },
        ];
      } else {
        if (categories) {
          query.category = { $in: categories.split(",") };
        }
        if (brands) {
          query.brand = { $in: brands.split(",") };
        }
      }

      if (reqminPrice && reqmaxPrice) {
        query.price = { $gte: reqminPrice, $lte: reqmaxPrice };
      }
      let sortOrder = {};
      if (sort_by) {
        switch (sort_by) {
          case "popularity":
            sortOrder = { popularity: -1 };
            break;
          case "L-H":
            sortOrder = { price: 1 };
            break;
          case "H-L":
            sortOrder = { price: -1 };
            break;
          case "a-z":
            sortOrder =  { name: { $meta: "textScore" } };
            break;
          case "z-a":
            sortOrder ={ name: { $meta: "textScore" }, name: -1 };
            break;
          case "date":
            sortOrder = { createdAt: -1 };
            break;
          default:
            // Default sorting option
            sortOrder = { _id: 1 };
        }
      } else {
        sortOrder = { id: -1 };
      }
      let collation={};
      if (sort_by === "a-z" || sort_by === "z-a") {
        sortOrder.name = sort_by === "a-z" ? 1 : -1;
        // Add collation for case insensitivity
         collation = { locale: 'en', caseLevel: false };
      }
      const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
      const [productData, categoryData, brandData, cart] = await Promise.all([
        Product.find(query).collation(collation).sort(sortOrder).skip(skip).limit(limit),
        Category.find({}),
        Brand.find({}),
        Cart.findOne({ userid: req.session.userid })
    ]);
    const totalPages = Math.ceil(productData.length / limit);

    
      let updatedCart = [];
      let subtotal = 0;
      const result = await Product.aggregate([
        {
          $group: {
            _id: null,
            minPrice: { $min: "$price" },
            maxPrice: { $max: "$price" },
          },
        },
      ]);

      if (result.length > 0) {
        minPrice = result[0].minPrice;
        maxPrice = result[0].maxPrice;
      }

      if (req.session && req.session.userid) {
        console.log("req.session.userid", req.session.userid);

        const [userData, wishlist] = await Promise.all([
          User.findById(req.session.userid),
          Wishlist.findOne({ userid: req.session.userid })
      ]);
      

        let productids = [];
        if (wishlist) {
          productids = wishlist.products.map((items) =>
            items.productid.toString()
          );
          console.log("wishlist product array", productids);
        }

        if (cart) {
          await cart.populate("products.productid");
          console.log("populated", cart);
          updatedCart = cart.products.map((item) => {
            const productTotal = item.productid.price * item.quantity || 0;
            return {
              _id: item.productid._id,
              name: item.productid.name,
              brand: item.productid.brand,
              category: item.productid.category,
              description: item.productid.description,
              image: item.productid.image,
              productcount: item.productid.quantity,
              quantity: item.quantity,
              volume: item.productid.volume,
              color: item.productid.color,
              price: item.productid.price,
              ratings: item.productid.ratings,
              updatedAt: item.productid.updatedAt,
              totalAmount: productTotal,
            };
          });

          subtotal = updatedCart.reduce(
            (total, item) => total + item.totalAmount,
            0
          );
        }

        console.log("..........uupdatedCart.............", updatedCart);

        data = {
          categoryData: categoryData,
          brandData: brandData,
          productData: productData,
          userData: userData,
          cartData: updatedCart,
          userWishlist: productids,
          wishcount: productids.length,
          minPrice,
          maxPrice,
          subtotal,
          currentPage: page,
          totalPages,
          limit,
          totalProducts:productData?.length||0
        };
      } else {
        data = {
          categoryData: categoryData,
          brandData: brandData,
          productData: productData,

          minPrice,
          maxPrice,
          currentPage: page,
          totalPages,
          limit,
          totalProducts:productData?.length||0
        };
      }

      res.render("frontend/sheproducts", data);
    } catch (error) {
      console.log(error.message);
    }
  },
  // async postSearchProduct(req, res) {
  //   const searchTerm = req.body.search;
  //   const page = parseInt(req.query.page) || 1;
  //   const limit = parseInt(req.query.limit) || 12;
  //   const skip = (page - 1) * limit;

  //   if (req.isAuthenticated()) {
  //     req.session.userid = req.session.passport.user;
  //     console.log("ys authenticated");
  //   } else console.log("not authenticated");

  //   let data;
  //   let minPrice = 0;
  //   let maxPrice = 0;
  //   let cartArray = [];
  //   let cart;
  //   try {
  //     let updatedCart = [];
  //     let subtotal = 0;
  //     const [productData, categoryData, brandData, cart, result] = await Promise.all([
  //       Product.find({
  //         $or: [
  //           { name: { $regex: new RegExp(searchTerm, "i") } },
  //           { category: { $regex: new RegExp(searchTerm, "i") } },
  //           { brand: { $regex: new RegExp(searchTerm, "i") } },
  //         ],
  //       }),
  //       Category.find({}),
  //       Brand.find({}),
  //       Cart.findOne({
  //         userid: req.session.userid,
  //       }),
  //       Product.aggregate([
  //         {
  //           $group: {
  //             _id: null,
  //             minPrice: { $min: "$price" },
  //             maxPrice: { $max: "$price" },
  //           },
  //         },
  //       ]),
  //     ]);
      

  //     if (result.length > 0) {
  //       minPrice = result[0].minPrice;
  //       maxPrice = result[0].maxPrice;
  //     }

  //     if (req.session && req.session.userid) {
  //       console.log("req.session.userid", req.session.userid);

  //       const [userData, wishlist] = await Promise.all([
  //         User.findById(req.session.userid),
  //         Wishlist.findOne({ userid: req.session.userid })
  //       ]);
  //       let productids = [];
  //       if (wishlist) {
  //         productids = wishlist.products.map((items) =>
  //           items.productid.toString()
  //         );
  //         console.log("wishlist product array", productids);
  //       }

  //       if (cart) {
  //         await cart.populate("products.productid");
  //         console.log("populated", cart.products);
  //         updatedCart = cart.products?.map((item) => {
  //           const productTotal = item.productid.price * item.quantity || 0;
  //           return {
  //             _id: item.productid._id,
  //             name: item.productid.name,
  //             brand: item.productid.brand,
  //             category: item.productid.category,
  //             description: item.productid.description,
  //             image: item.productid.image,
  //             productcount: item.productid.quantity,
  //             quantity: item.quantity,
  //             volume: item.productid.volume,
  //             color: item.productid.color,
  //             price: item.productid.price,
  //             ratings: item.productid.ratings,
  //             updatedAt: item.productid.updatedAt,
  //             totalAmount: productTotal,
  //           };
  //         });

  //         subtotal = updatedCart.reduce(
  //           (total, item) => total + item.totalAmount,
  //           0
  //         );
  //       }

  //       console.log(
  //         "..........post .......................updated product.............",
  //         updatedCart
  //       );

  //       data = {
  //         categoryData: categoryData,
  //         brandData: brandData,
  //         productData: productData,
  //         userData: userData,
  //         cartData: updatedCart,
  //         userWishlist: productids,
  //         wishcount: productids.length,
  //         minPrice,
  //         maxPrice,
  //         subtotal,
  //       };
  //     } else {
  //       data = {
  //         categoryData: categoryData,
  //         brandData: brandData,
  //         productData: productData,
  //         currentPage: page,
  //         totalPages,
  //         limit,
  //         minPrice,
  //         maxPrice,
  //       };
  //     }

  //     res.render("frontend/sheproducts", data);
  //   } catch (error) {
  //     console.log(error.message);
  //   }
  // },
  async postSearchProduct(req, res) {
    const searchTerm = req.body.search;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
  
    if (req.isAuthenticated()) {
      req.session.userid = req.session.passport.user;
      console.log("ys authenticated");
    } else console.log("not authenticated");
  
    let data;
    let minPrice = 0;
    let maxPrice = 0;
    let cartArray = [];
    let cart;
    try {
      let updatedCart = [];
      let subtotal = 0;
      
      // Search query
      const searchQuery = {
        $or: [
          { name: { $regex: new RegExp(searchTerm, "i") } },
          { category: { $regex: new RegExp(searchTerm, "i") } },
          { brand: { $regex: new RegExp(searchTerm, "i") } },
        ],
      };
      
      const [productData, categoryData, brandData, cart, result, totalProducts] = await Promise.all([
        Product.find(searchQuery).skip(skip).limit(limit),
        Category.find({}),
        Brand.find({}),
        Cart.findOne({
          userid: req.session.userid,
        }),
        Product.aggregate([
          {
            $group: {
              _id: null,
              minPrice: { $min: "$price" },
              maxPrice: { $max: "$price" },
            },
          },
        ]),
        Product.countDocuments(searchQuery) // Count total matching products
      ]);
      
      const totalPages = Math.ceil(totalProducts / limit);
  
      if (result.length > 0) {
        minPrice = result[0].minPrice;
        maxPrice = result[0].maxPrice;
      }
  
      if (req.session && req.session.userid) {
        console.log("req.session.userid", req.session.userid);
  
        const [userData, wishlist] = await Promise.all([
          User.findById(req.session.userid),
          Wishlist.findOne({ userid: req.session.userid })
        ]);
        let productids = [];
        if (wishlist) {
          productids = wishlist.products.map((items) =>
            items.productid.toString()
          );
          console.log("wishlist product array", productids);
        }
  
        if (cart) {
          await cart.populate("products.productid");
          console.log("populated", cart.products);
          updatedCart = cart.products?.map((item) => {
            const productTotal = item.productid.price * item.quantity || 0;
            return {
              _id: item.productid._id,
              name: item.productid.name,
              brand: item.productid.brand,
              category: item.productid.category,
              description: item.productid.description,
              image: item.productid.image,
              productcount: item.productid.quantity,
              quantity: item.quantity,
              volume: item.productid.volume,
              color: item.productid.color,
              price: item.productid.price,
              ratings: item.productid.ratings,
              updatedAt: item.productid.updatedAt,
              totalAmount: productTotal,
            };
          });
  
          subtotal = updatedCart.reduce(
            (total, item) => total + item.totalAmount,
            0
          );
        }
  
        data = {
          categoryData: categoryData,
          brandData: brandData,
          productData: productData,
          userData: userData,
          cartData: updatedCart,
          userWishlist: productids,
          wishcount: productids.length,
          minPrice,
          maxPrice,
          subtotal,
          currentPage: page,
          totalPages,
          limit,
          totalProducts
        };
      } else {
        data = {
          categoryData: categoryData,
          brandData: brandData,
          productData: productData,
          currentPage: page,
          totalPages,
          limit,
          totalProducts,
          minPrice,
          maxPrice,
        };
      }
  
      res.render("frontend/sheproducts", data);
    } catch (error) {
      console.log(error.message);
      res.render('frontend/error', {title: "Error", message: "An error occurred while searching products"});
    }
  }
};
module.exports = productController;
