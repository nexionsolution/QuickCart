import messageModel from "../models/messageModel.js";
import userModel from "../models/userModel.js";

// Send a message
const sendMessage = async (req, res) => {
    try {
        const { userId, receiverId, text, productId } = req.body;

        if (!receiverId || !text) {
            return res.json({ success: false, message: "Missing required fields" });
        }

        const newMessage = new messageModel({
            senderId: userId,
            receiverId,
            text,
            productId: productId || null
        });

        await newMessage.save();
        res.json({ success: true, message: "Message sent", chatMessage: newMessage });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Get chat history between current user and another user
const getChatHistory = async (req, res) => {
    try {
        const { userId } = req.body;
        const { otherUserId } = req.params;

        if (!otherUserId) {
            return res.json({ success: false, message: "Other user ID is required" });
        }

        const messages = await messageModel.find({
            $or: [
                { senderId: userId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: userId }
            ]
        }).sort({ createdAt: 1 });

        res.json({ success: true, messages });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Get all active conversations for the seller inbox
const getInbox = async (req, res) => {
    try {
        const { userId } = req.body; // The logged-in seller

        // Find all messages where the seller is either sender or receiver
        const allMessages = await messageModel.find({
            $or: [{ senderId: userId }, { receiverId: userId }]
        }).sort({ createdAt: -1 });

        // Group by the "other" user to get the latest message per conversation
        const conversationsMap = new Map();

        allMessages.forEach(msg => {
            const otherUser = msg.senderId === userId ? msg.receiverId : msg.senderId;
            if (!conversationsMap.has(otherUser)) {
                conversationsMap.set(otherUser, msg);
            }
        });

        const conversations = Array.from(conversationsMap.values());

        // Populate basic details for the "other" user (customer names)
        const populatedConversations = await Promise.all(
            conversations.map(async (msg) => {
                const otherUser = msg.senderId === userId ? msg.receiverId : msg.senderId;
                const userDoc = await userModel.findById(otherUser).select('name email photo');
                return {
                    latestMessage: msg,
                    user: userDoc || { _id: otherUser, name: "Unknown User" }
                };
            })
        );

        res.json({ success: true, inbox: populatedConversations });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { sendMessage, getChatHistory, getInbox }
