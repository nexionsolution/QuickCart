import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

const adminAuth = async (req, res, next) => {
    try {
        const { token } = req.headers;
        if (!token) {
            return res.json({ success: false, message: "Not Authorized, Login Again" })
        }

        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(token_decode.id);

        if (!user || user.role !== 'seller') {
            return res.json({ success: false, message: "Not Authorized, Admin/Seller Only" })
        }
        
        // Pass userId forward if needed by seller operations
        if (!req.body) req.body = {};
        req.body.userId = token_decode.id;
        
        next();
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

export default adminAuth;
