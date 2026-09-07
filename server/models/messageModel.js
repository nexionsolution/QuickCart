import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    text: { type: String, required: true },
    productId: { type: String, default: null }, // Optional context
    isRead: { type: Boolean, default: false }
}, { timestamps: true });

const messageModel = mongoose.models.message || mongoose.model("message", messageSchema);

export default messageModel;
