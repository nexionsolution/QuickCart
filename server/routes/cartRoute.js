import express from 'express';
import { addToCart, getUserCart, updateCart } from '../controllers/cartController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const cartRouter = express.Router();

cartRouter.post('/get', authMiddleware, getUserCart);
cartRouter.post('/add', authMiddleware, addToCart);
cartRouter.post('/update', authMiddleware, updateCart);

export default cartRouter;
