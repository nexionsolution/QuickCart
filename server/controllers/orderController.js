import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import { sendOrderConfirmationToBuyer, sendNewOrderAlertToSeller, sendOrderStatusUpdate } from "../utils/emailService.js";

// Placing orders using COD Method
const placeOrder = async (req, res) => {
    try {
        const { userId, items, amount, address, paymentMethod = "COD", payment = false } = req.body;

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod,
            payment,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        await userModel.findByIdAndUpdate(userId, { cartData: {} });

        // Email Notification Logic
        try {
            const buyer = await userModel.findById(userId);
            if (buyer && buyer.email) {
                sendOrderConfirmationToBuyer(buyer.email, buyer.name || "Customer", newOrder);
            }

            // Group items by seller
            const sellerItemsMap = {};
            items.forEach(item => {
                const sellerId = item.product?.userId;
                if (sellerId) {
                    if (!sellerItemsMap[sellerId]) {
                        sellerItemsMap[sellerId] = [];
                    }
                    sellerItemsMap[sellerId].push(item);
                }
            });

            // Send email to each unique seller
            for (const sellerId in sellerItemsMap) {
                const seller = await userModel.findById(sellerId);
                if (seller && seller.email) {
                    sendNewOrderAlertToSeller(seller.email, seller.name || "Seller", newOrder, sellerItemsMap[sellerId]);
                }
            }
        } catch (emailError) {
            console.error("Error sending order placement emails:", emailError);
        }

        res.json({ success: true, message: "Order Placed", orderId: newOrder._id });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// All Orders data for Admin Panel
const allOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// User Order Data For Frontend
const userOrders = async (req, res) => {
    try {
        const { userId } = req.body;
        const orders = await orderModel.find({ userId });
        res.json({ success: true, orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Update Order status from Admin Panel
const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        await orderModel.findByIdAndUpdate(orderId, { status });

        // Send Status Update Email
        try {
            const order = await orderModel.findById(orderId);
            if (order) {
                const buyer = await userModel.findById(order.userId);
                if (buyer && buyer.email) {
                    sendOrderStatusUpdate(buyer.email, buyer.name || "Customer", orderId, status);
                }
            }
        } catch (emailError) {
            console.error("Error sending order status update email:", emailError);
        }

        res.json({ success: true, message: "Status Updated" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { placeOrder, allOrders, userOrders, updateStatus }
