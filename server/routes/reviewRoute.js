import express from 'express';
import { addReview, replyToReview, getProductReviews, getUserReviews, getSellerReviews } from '../controllers/reviewController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const reviewRouter = express.Router();

reviewRouter.post('/add', authMiddleware, addReview);
reviewRouter.post('/reply', authMiddleware, replyToReview);
reviewRouter.get('/product/:productId', getProductReviews);
reviewRouter.get('/user', authMiddleware, getUserReviews);
reviewRouter.get('/seller', authMiddleware, getSellerReviews);

export default reviewRouter;
