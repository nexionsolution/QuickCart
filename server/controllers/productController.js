import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";

// Add Product
const addProduct = async (req, res) => {
    try {
        const { name, description, price, offerPrice, category, userId, brand, color, madeIn, manufactureDate, weight, warranty, imageUrls } = req.body;

        const image0 = req.files.image0 && req.files.image0[0];
        const image1 = req.files.image1 && req.files.image1[0];
        const image2 = req.files.image2 && req.files.image2[0];
        const image3 = req.files.image3 && req.files.image3[0];

        const images = [image0, image1, image2, image3].filter((item) => item !== undefined);

        let uploadedImagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, { resource_type: "image" });
                return result.secure_url;
            })
        );

        let parsedImageUrls = [];
        if (imageUrls) {
            try {
                parsedImageUrls = JSON.parse(imageUrls);
            } catch (e) {
                if (typeof imageUrls === 'string') parsedImageUrls = [imageUrls];
            }
        }

        const finalImagesUrl = [...uploadedImagesUrl, ...parsedImageUrls];

        const productData = {
            name,
            description,
            category,
            brand,
            color,
            madeIn,
            manufactureDate,
            weight,
            warranty,
            price: Number(price),
            offerPrice: Number(offerPrice),
            image: finalImagesUrl,
            date: Date.now(),
            userId
        };

        const product = new productModel(productData);
        await product.save();

        res.json({ success: true, message: "Product Added" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// List Products (for Clients - only visible)
const listProducts = async (req, res) => {
    try {
        const products = await productModel.find({ isVisible: { $ne: false } });
        res.json({ success: true, products });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Remove Product
const removeProduct = async (req, res) => {
    try {
        await productModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Product Removed" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Single Product Info
const singleProduct = async (req, res) => {
    try {
        const { productId } = req.body;
        const product = await productModel.findById(productId);
        res.json({ success: true, product });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Seller List Products (All products)
const sellerListProducts = async (req, res) => {
    try {
        const products = await productModel.find({});
        res.json({ success: true, products });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Update Product
const updateProduct = async (req, res) => {
    try {
        const { id, ...updateData } = req.body;
        await productModel.findByIdAndUpdate(id, updateData);
        res.json({ success: true, message: "Product Updated Successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { addProduct, listProducts, removeProduct, singleProduct, sellerListProducts, updateProduct };
