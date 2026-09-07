import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/db.js';
import connectCloudinary from './config/cloudinary.js';
import authRouter from './routes/authRoute.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import addressRouter from './routes/addressRoute.js';
import chatRouter from './routes/chatRoute.js';
import reviewRouter from './routes/reviewRoute.js';

// App Config
const app = express();
const port = process.env.PORT || 5000;
connectDB();
connectCloudinary();

// Middlewares
app.use(express.json());
app.use(cors());

// API Endpoints
app.use('/api/auth', authRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/api/user', addressRouter);
app.use('/api/chat', chatRouter);
app.use('/api/review', reviewRouter);

app.get('/', (req, res) => {
    res.send("API is running...");
});

// Start Server
app.listen(port, () => {
    console.log(`Server started on PORT: ${port}`);
});

export default app;
