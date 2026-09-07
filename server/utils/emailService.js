import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Helper to send emails asynchronously without blocking
const sendMailAsync = async (mailOptions) => {
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${mailOptions.to}`);
    } catch (error) {
        console.error(`Error sending email to ${mailOptions.to}:`, error.message);
    }
};

export const sendWelcomeEmail = (email, name) => {
    const mailOptions = {
        from: `"TecHub Store" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Welcome to TecHub! 🎉',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
                <h2 style="color: #ea580c;">Welcome to TecHub, ${name}!</h2>
                <p>We are thrilled to have you join our community.</p>
                <p>Start exploring thousands of products from independent sellers today. If you have any questions or need help, just reply to this email.</p>
                <br/>
                <p>Happy Shopping!</p>
                <p><strong>The TecHub Team</strong></p>
            </div>
        `
    };
    sendMailAsync(mailOptions);
};

export const sendOrderConfirmationToBuyer = (email, name, order) => {
    const totalAmount = order.amount.toFixed(2);
    const itemsList = order.items.map(item => `<li>${item.product.name} (x${item.quantity})</li>`).join('');

    const mailOptions = {
        from: `"TecHub Orders" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Order Confirmation - #${order._id.toString().substring(0,8).toUpperCase()}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; border: 1px solid #eee; border-radius: 8px;">
                <h2 style="color: #ea580c;">Thank You For Your Order!</h2>
                <p>Hi ${name},</p>
                <p>We've received your order and the sellers have been notified. We will let you know when it ships!</p>
                
                <h3 style="border-bottom: 1px solid #eee; padding-bottom: 5px;">Order Summary</h3>
                <p><strong>Order ID:</strong> #${order._id.toString().substring(0,8).toUpperCase()}</p>
                <ul>
                    ${itemsList}
                </ul>
                <p style="font-size: 18px; color: #ea580c;"><strong>Total Amount: $${totalAmount}</strong></p>
                
                <h3 style="border-bottom: 1px solid #eee; padding-bottom: 5px;">Shipping Address</h3>
                <p>${order.address.fullName}<br/>${order.address.area}, ${order.address.city}, ${order.address.state}<br/>Phone: ${order.address.phoneNumber}</p>
                
                <p style="margin-top: 30px; font-size: 12px; color: #888;">If you have any questions, reply to this email.</p>
            </div>
        `
    };
    sendMailAsync(mailOptions);
};

export const sendNewOrderAlertToSeller = (sellerEmail, sellerName, order, items) => {
    const itemsList = items.map(item => `<li>${item.product.name} (x${item.quantity})</li>`).join('');

    const mailOptions = {
        from: `"TecHub Seller Portal" <${process.env.EMAIL_USER}>`,
        to: sellerEmail,
        subject: `New Order Received! Action Required`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; border: 1px solid #eee; border-radius: 8px;">
                <h2 style="color: #ea580c;">Cha-Ching! New Sale! 💰</h2>
                <p>Hi ${sellerName},</p>
                <p>Great news! A customer just purchased items from your shop. Please log into your Seller Dashboard to fulfill the order.</p>
                
                <h3 style="border-bottom: 1px solid #eee; padding-bottom: 5px;">Items to Fulfill</h3>
                <ul>
                    ${itemsList}
                </ul>
                
                <h3 style="border-bottom: 1px solid #eee; padding-bottom: 5px;">Customer Shipping Details</h3>
                <p>${order.address.fullName}<br/>${order.address.area}, ${order.address.city}, ${order.address.state}</p>
                
                <a href="http://localhost:3000/seller" style="display: inline-block; padding: 10px 20px; margin-top: 20px; background-color: #ea580c; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Dashboard</a>
            </div>
        `
    };
    sendMailAsync(mailOptions);
};

export const sendOrderStatusUpdate = (email, name, orderId, status) => {
    let message = "Your order status has been updated.";
    if (status === 'Shipped') message = "Great news! Your order is on its way.";
    if (status === 'Delivered') message = "Your order has been delivered! Don't forget to leave a review.";

    const mailOptions = {
        from: `"TecHub Tracking" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Update on Order #${orderId.toString().substring(0,8).toUpperCase()}: ${status}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; border: 1px solid #eee; border-radius: 8px;">
                <h2 style="color: #ea580c;">Order Status: ${status}</h2>
                <p>Hi ${name},</p>
                <p>${message}</p>
                
                <p><strong>Order ID:</strong> #${orderId.toString().substring(0,8).toUpperCase()}</p>
                
                <p style="margin-top: 30px; font-size: 12px; color: #888;">Thank you for shopping with TecHub.</p>
            </div>
        `
    };
    sendMailAsync(mailOptions);
};
