import reviewModel from "../models/reviewModel.js";
import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";

// Customer adds a review
const addReview = async (req, res) => {
    try {
        const { userId, productId, orderId, rating, text } = req.body;

        // Check if already reviewed
        const existingReview = await reviewModel.findOne({ userId, productId, orderId });
        if (existingReview) {
            return res.json({ success: false, message: "You have already reviewed this item from this order." });
        }

        // Get the seller of the product
        const product = await productModel.findById(productId);
        if (!product) {
            return res.json({ success: false, message: "Product not found." });
        }

        const newReview = new reviewModel({
            userId,
            productId,
            orderId,
            rating,
            text,
            sellerId: product.userId || "admin" // Fallback if no seller
        });

        await newReview.save();
        res.json({ success: true, message: "Review added successfully!" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Seller replies to a review
const replyToReview = async (req, res) => {
    try {
        const { userId, reviewId, replyText } = req.body; // userId here is the logged in seller

        const review = await reviewModel.findById(reviewId);
        if (!review) {
            return res.json({ success: false, message: "Review not found" });
        }

        if (review.sellerId !== userId && userId !== "admin") {
            return res.json({ success: false, message: "Not authorized to reply to this review" });
        }

        review.sellerReply = replyText;
        await review.save();

        res.json({ success: true, message: "Reply added successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Get reviews for a specific product
const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        const reviews = await reviewModel.find({ productId }).sort({ createdAt: -1 });
        
        // Populate user details manually since we store userId as String instead of ObjectId ref
        const populatedReviews = await Promise.all(
            reviews.map(async (review) => {
                const user = await userModel.findById(review.userId).select('name photo');
                return {
                    ...review.toObject(),
                    user: user || { name: "Anonymous" }
                };
            })
        );

        res.json({ success: true, reviews: populatedReviews });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Get all reviews for a specific user (Customer)
const getUserReviews = async (req, res) => {
    try {
        const { userId } = req.body;
        const reviews = await reviewModel.find({ userId });
        res.json({ success: true, reviews });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Get all reviews on a seller's products (Seller Inbox)
const getSellerReviews = async (req, res) => {
    try {
        const { userId } = req.body;
        const reviews = await reviewModel.find({ sellerId: userId }).sort({ createdAt: -1 });
        
        const populatedReviews = await Promise.all(
            reviews.map(async (review) => {
                const user = await userModel.findById(review.userId).select('name photo');
                const product = await productModel.findById(review.productId).select('name image');
                return {
                    ...review.toObject(),
                    user: user || { name: "Anonymous" },
                    product: product || { name: "Deleted Product", image: [] }
                };
            })
        );

        res.json({ success: true, reviews: populatedReviews });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { addReview, replyToReview, getProductReviews, getUserReviews, getSellerReviews }
