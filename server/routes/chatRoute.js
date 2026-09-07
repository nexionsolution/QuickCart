import express from 'express';
import { sendMessage, getChatHistory, getInbox } from '../controllers/chatController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const chatRouter = express.Router();

chatRouter.post('/send', authMiddleware, sendMessage);
chatRouter.get('/history/:otherUserId', authMiddleware, getChatHistory);
chatRouter.get('/inbox', authMiddleware, getInbox);

export default chatRouter;
