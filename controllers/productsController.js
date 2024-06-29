const productModel=require('../models/productModel')
const categoryModel=require('../models/categoryModel')
const brandModel=require('../models/brandModel')
const Order=require("../models/orderModel")
const cropperjs=require('cropperjs')
const path = require('path');
const fs = require('fs');


const productController={
    async get_products(req,res){
        try {
            const products=await productModel.find({}).sort({createdAt:-1});
          
            res.render('products',{products:products});
        } catch (err) {
            res.status(500).json({ message: err.message });
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
                res.render("productUpdate", { product:product[0],categories: categories, brands: brands,blobUrls })
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
                console.log("product updated");
               
            }
            
            
            res.json({isvalid:true});
    
    
        } catch (error) {
            res.json({isvalid:false});
            console.log(error.message);
        }
    },
  
    async getaddProduct(req, res) {
        try {
            const [categories, brands] = await Promise.all([
                categoryModel.find(),
                brandModel.find()
              ]);
            res.render("productadd", { categories: categories, brands: brands })
        } catch (error) {
            console.log(error.message);
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
                res.json({isvalid:true});
            } else {
    
                res.json({isvalid:false});
            }
    
        } catch (error) {
            console.log(error.message);
        }

      
    },
    async postDeleteproduct(req, res) {
        console.log("you are in product delete ")
        try {
          const id = req.params.id;



    const deletedproduct = await productModel.findByIdAndDelete(id);
      
          if (deletedproduct) {
            console.log("product deleted successfully:", deletedproduct);
            res.redirect("/admin/products");
          } else {
            console.log("Category not found");
            res.redirect("/admin/products");
          }
        } catch (error) {
          console.log("Error deleting category:", error.message);
          res.status(500).json({ error: "Internal server error" });
        }
      },
      async postApplyOffer(req,res){
        console.log(" in postApplyOffer req.body",req.body)
        
       try{
       const products=await productModel.find({_id:{'$in':req.body.offerids}})
       for (const product of products) {
        product.offerpercentage = req.body.offerPercentage;
        product.price=product.regularprice-(product.regularprice*req.body.offerPercentage/100);
        await product.save();
        console.log("product after save",product)
        res.json({message:"offer applied successfully"})

       }
    
       }
       catch(err){
        res.status(404).json({err})
       }
      }
};
module.exports=productController