import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    offerPrice: { type: Number, required: true },
    image: { type: Array, required: true },
    category: { type: String, required: true },
    brand: { type: String },
    color: { type: String },
    madeIn: { type: String },
    manufactureDate: { type: String },
    weight: { type: String },
    warranty: { type: String },
    date: { type: Number, required: true },
    userId: { type: String }, // To track which admin/seller added it if needed
    isVisible: { type: Boolean, default: true }
});

const productModel = mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;
