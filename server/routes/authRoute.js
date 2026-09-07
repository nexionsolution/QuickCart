import express from 'express';
import { loginUser, registerUser, becomeSeller, getUserProfile, updateProfilePhoto } from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import upload from '../middleware/multer.js';

const authRouter = express.Router();

authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser);
authRouter.post('/become-seller', authMiddleware, becomeSeller);
authRouter.get('/profile', authMiddleware, getUserProfile);
authRouter.post('/update-photo', upload.single('photo'), authMiddleware, updateProfilePhoto);

export default authRouter;
