require('events').EventEmitter.defaultMaxListeners = 20;

const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { notFound, errorHandler } = require('./middlewares/error.middleware.js');
const mongoose = require('mongoose');

// Initialize Server
console.log('\x1b[34m%s\x1b[0m', `
===========================================
🚀 Initializing XY-Essentials Server...
===========================================
`);

// Load Environment Variables
dotenv.config({ path: path.resolve(__dirname, 'config/.env') });

// Connect to Database
try {
    connectDB();
    console.log('\x1b[32m%s\x1b[0m', '✨ Attempting to connect to MongoDB...');
} catch (error) {
    console.log('\x1b[31m%s\x1b[0m', '❌ Database connection failed:', error.message);
    process.exit(1);
}

// Route Imports
const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const cartRoutes = require('./routes/cart.routes');
const mailRoutes = require('./routes/mail.routes');
const adminRoutes = require('./routes/admin.routes');
const categoryRoutes = require('./routes/category.routes');
const couponRoutes = require('./routes/coupon.routes');
const comboRoutes = require('./routes/combo.routes.js');
const addressRoutes = require('./routes/address.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const paymentRoutes = require('./routes/payment.routes');
const reviewRoutes = require('./routes/review.routes');
const blogRoutes = require('./routes/blog.routes');
const emailRoutes = require('./routes/email.routes');

// Initialize Express
const app = express();

// Middleware Configuration
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
    : ['http://localhost:5173'];

const corsOptions = {
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// API Base URL
const apiUrl = process.env.API_URL || 'http://localhost:5000';

// MongoDB Connection Logging
mongoose.connection.once('open', () => {
    console.log('\x1b[32m%s\x1b[0m', '✅ MongoDB database connection established successfully');
});

mongoose.connection.on('error', (err) => {
    console.log('\x1b[31m%s\x1b[0m', '❌ MongoDB connection error:', err);
});

// Global Error Handling
process.on('unhandledRejection', (error) => {
    console.log('\x1b[31m%s\x1b[0m', '❌ Unhandled Rejection:', error.message);
});

// Health Check Route
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Server is healthy',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/mails', mailRoutes);
app.use('/api/combos', comboRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/email', emailRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Server Configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Start Server
app.listen(PORT, () => {
    console.log('\x1b[34m%s\x1b[0m', `
===========================================
🚀 XY-Essentials Server Status
===========================================
🌐 Environment: ${NODE_ENV}
🔌 Port: ${PORT}
📍 API URL: ${apiUrl}
🌍 CORS Origins: ${corsOrigins}
===========================================
    `);
});

// Graceful Shutdown Handlers
process.on('SIGTERM', () => {
    console.log('\x1b[33m%s\x1b[0m', '👋 SIGTERM received. Shutting down gracefully');
    mongoose.connection.close(() => {
        console.log('\x1b[33m%s\x1b[0m', '📝 MongoDB connection closed.');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\x1b[33m%s\x1b[0m', '👋 SIGINT received. Shutting down gracefully');
    mongoose.connection.close(() => {
        console.log('\x1b[33m%s\x1b[0m', '📝 MongoDB connection closed.');
        process.exit(0);
    });
});

// Export app for testing purposes
module.exports = app;