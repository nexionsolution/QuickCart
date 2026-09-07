# TecHub - Multi-Vendor E-Commerce Platform

TecHub is a comprehensive, full-stack multi-vendor e-commerce platform. It empowers independent sellers to list their products while providing a seamless, feature-rich shopping experience for customers.

## 🚀 Features

### For Customers (Buyers)
* **Browse & Search:** Discover thousands of products with dynamic search and filtering.
* **Shopping Cart:** Real-time cart management with instant price calculation.
* **Order Tracking:** Place orders and track their real-time status from "Placed" to "Delivered".
* **Real-time Chat Portal:** Instantly chat with the specific seller of a product using the floating chat widget on product pages.
* **Reviews & Ratings:** Leave 1-5 star ratings and written reviews on purchased items once delivered.
* **Email Notifications:** Receive automated HTML emails for registration, order confirmation, and shipping updates.

### For Sellers
* **Seller Dashboard:** A dedicated portal to manage your business.
* **Product Management:** Upload products with rich descriptions and multiple images (powered by Cloudinary).
* **Order Fulfillment:** View incoming orders and update their status (triggers email alerts to buyers).
* **Customer Support:** A dedicated Messages inbox to reply to real-time customer inquiries.
* **Review Management:** Read customer reviews on your products and post official seller replies that show up publicly.
* **Email Alerts:** Get instant email notifications the moment a customer buys one of your products.

## 💻 Tech Stack

* **Frontend:** Next.js, React, Tailwind CSS
* **Backend:** Node.js, Express.js
* **Database:** MongoDB, Mongoose
* **Authentication:** JWT (JSON Web Tokens), bcryptjs
* **Storage:** Cloudinary (for image uploads)
* **Emails:** Nodemailer (for automated transactional emails)

## 🛠️ Installation & Setup

### Prerequisites
* Node.js installed
* MongoDB URI
* Cloudinary Account
* SMTP credentials (e.g., Gmail App Password)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/techub-ecommerce.git
cd techub-ecommerce
```

### 2. Setup Backend (Server)
Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory and add your environment variables:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Nodemailer SMTP
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

Start the backend server:
```bash
npm run dev
```

### 3. Setup Frontend (Client)
Open a new terminal, navigate to the client directory, and install dependencies:
```bash
cd client
npm install
```

Create a `.env.local` file in the `client` directory:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_CURRENCY=$
```

Start the frontend development server:
```bash
npm run dev
```

### 4. Open the App
Visit `http://localhost:3000` in your browser!

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📝 License
This project is open source and available under the [MIT License](LICENSE).
