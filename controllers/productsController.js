const productModel=require('../models/productModel')
const categoryModel=require('../models/categoryModel')
const brandModel=require('../models/brandModel')
const Order=require("../models/orderModel")
const cropperjs=require('cropperjs')
const path = require('path');
const fs = require('fs');
const HTTP_STATUS = require('../utils/httpStatus'); 


const productController={
    async get_products(req, res) {
        try {
          const page = parseInt(req.query.page) || 1;
          const limit = parseInt(req.query.limit) || 10;
          const skip = (page - 1) * limit;
      
          const products = await productModel.find({})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
      
          const totalProducts = await productModel.countDocuments();
          const totalPages = Math.ceil(totalProducts / limit);
      
          res.status(HTTP_STATUS.OK).render('products', { 
            products, 
            currentPage: page, 
            totalPages, 
            limit 
          });
        } catch (err) {
          res.status(HTTP_STATUS.NOT_FOUND).render('frontend/error', {
            title: "Not Found...!", 
            message: "Product not found"
          });
        }
      },
      
 
    async getUdateProducts(req,res){
        try {
            console.log("you are gettin update product",req.params.id)

            const id = req.params.id
            
            const product = await productModel.find({ _id: id })

            const blobUrls = [];

            for (const image of product[0].image) {
                const baseUrl = process.env.SERVER_URL || 'http://localhost:3000';
                const imageUrl = `${baseUrl}/public/uploads/product-images/${image}`;
                 const response = await fetch(imageUrl);
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);

                const imagePath = path.join(__dirname,'..', 'public', 'uploads', 'product-images', image);
                const imageFile = fs.readFileSync(imagePath);
                const imageData = imageFile.toString('base64');
                blobUrls.push({ image, blobUrl:imageData });
            }
            
            if (product) {
                const [categories, brands] = await Promise.all([
                    categoryModel.find(),
                    brandModel.find()
                  ]);
                res.status().render("productUpdate", { product:product[0],categories: categories, brands: brands,blobUrls })
            } else {
                console.log("product not found");
            }
    
        } catch (error) {
            console.log(error.message);
        }
    },
    async postUdateProducts(req,res){
        console.log("you are updating product: imageIndex",req.body)
        const imgindex=req.body.imageindex.split(",");
        console.log("you are updating product: imageIndex",imgindex)

        try {
            const id = req.params.id
            const data = req.body
            let images = []
            if(imgindex.length>0){
                const updateimageOfProduct=await productModel.findById(id)
                const imageToUpdate = updateimageOfProduct.image;
               
                images = imageToUpdate.filter((image, index) => imgindex.includes(index.toString()));
                console.log("you are updating product:index array",images)

                updateimageOfProduct.image=images;
                await updateimageOfProduct.save();
                }


          
            if (req.files && req.files.length > 0) {
                for (let i = 0; i < req.files.length; i++) {
                    images.push(req.files[i].filename);
                }
            }
            console.log("you are updating product",images)

            if (req.files.length > 0) {
                console.log("req.files.length",req.files.length,images)

                const updatedProduct = await productModel.findByIdAndUpdate(id, {
                    name:data.productName,
                    description: data.productdescription,
                    brand: data.brandname,
                    category: data.categoryname,
                    regularprice:data.price,
                    price:data.price,
                    quantity:data.quantity,
                    volume:data.volume,
                    color:data.color,
                    image:images,
                   
                })
                console.log("product updated");
               
            }
            
            else {
                console.log("No images i thter")
                const updatedProduct = await productModel.findByIdAndUpdate(id, {
                    name:data.productName,
                    description: data.productdescription,
                    brand: data.brandname,
                    category: data.categoryname,
                    price:data.price,
                    quantity:data.quantity,
                    volume:data.volume,
                    color:data.color,
                   
                })               
            }
            
            
            res.status(HTTP_STATUS.OK).json({isvalid:true});
    
    
        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({isvalid:false});
        }
    },
  
    async getaddProduct(req, res) {
        try {
            const [categories, brands] = await Promise.all([
                categoryModel.find(),
                brandModel.find()
              ]);
            res.status(HTTP_STATUS.OK).render("productadd", { categories: categories, brands: brands })
        } catch (error) {
            res.sendStatus(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        }
       
    },

    async postaddProduct(req, res) {
        console.log("add product req.files",req.files)
         console.log("add product",req.body)

         try {
            const {productName,productdescription,brandname,price,quantity,volume,color,categoryname}= req.body
          
            const productExists = await productModel.findOne({ name:productName })
            if (!productExists) {
                const images = []
                if (req.files && req.files.length > 0) {
                    for (let i = 0; i < req.files.length; i++) {
                        images.push(req.files[i].filename);
                    }
                }
    
                const newProduct = new productModel({
                    name:productName,
                    description: productdescription,
                    brand: brandname,
                    category: categoryname,
                    regularprice:price,
                    price:price,
                    quantity:quantity,
                    volume:volume,
                    color:color,
                    image: images
                })
                await newProduct.save()
                res.status(HTTP_STATUS.OK).json({isvalid:true});
            } else {
    
                res.status(HTTP_STATUS.NOT_FOUND).json({isvalid:false});
            }
    
        } catch (error) {
            console.log(error.message);
        }

      
    },
    async postDeleteproduct(req, res) {
        try {
          const id = req.params.id;



    const deletedproduct = await productModel.findByIdAndDelete(id);
      
          if (deletedproduct) {
            res.redirect("/admin/products");
          } else {
            res.redirect("/admin/products");
          }
        } catch (error) {
          res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
        }
      },
      async postApplyOffer(req,res){
        
       try{
       const products=await productModel.find({_id:{'$in':req.body.offerids}})
       for (const product of products) {
        product.offerpercentage = req.body.offerPercentage;
        product.price=product.regularprice-(product.regularprice*req.body.offerPercentage/100);
        await product.save();
        res.status(HTTP_STATUS.OK).json({message:"offer applied successfully"})
       }
    
       }
       catch(err){
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({err})
       }
      }
};
module.exports=productController