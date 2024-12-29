const { Resend } = require('resend');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../config/.env') });
const resend = new Resend(process.env.RESEND_API_KEY);
console.log('Resend API client initialized:', resend);


const sendOrderConfirmation = async (user, order) => {
    try {
        await resend.emails.send({
            from: 'XY Essentials <aakarshgoyal23@gmail.com>',
            to: user.email,
            subject: 'Order Confirmation - XY Essentials',
            html: `
                <h1>Thank you for your order!</h1>
                <p>Hi ${user.name},</p>
                <p>Your order #${order._id} has been confirmed.</p>
                <h2>Order Details:</h2>
                <p>Total Amount: ₹${order.totalAmount}</p>
                <p>Delivery Address: ${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}</p>
                <p>Track your order at: <a href="http://localhost:5173/orders/${order._id}">Order Status</a></p>
            `
        });
    } catch (error) {
        console.error('Error sending order confirmation email:', error);
    }
};

const sendOrderStatusUpdate = async (user, order) => {
    try {
        await resend.emails.send({
            from: 'XY Essentials <updates@xyessentials.com>',
            to: user.email,
            subject: `Order Status Update - ${order.status}`,
            html: `
                <h1>Order Status Update</h1>
                <p>Hi ${user.name},</p>
                <p>Your order #${order._id} has been ${order.status}.</p>
                <p>Track your order at: <a href="http://localhost:5173/orders/${order._id}">Order Status</a></p>
            `
        });
    } catch (error) {
        console.error('Error sending status update email:', error);
    }
};

const sendWelcomeEmail = async (name) => {
    try {
        await resend.emails.send({
            from: 'XY Essentials <aakarshgoyal23@gmail.com>',
            to: "aakarshgoyal23@gmail.com",
            subject: 'Welcome to XY Essentials!',
            html: `
                <h1>Welcome to XY Essentials!</h1>
                <p>Hi ${name},</p>
                <p>Thank you for creating an account with us.</p>
                <p>Start shopping now: <a href="http://localhost:5173">XY Essentials</a></p>
            `
        });
    } catch (error) {
        console.error('Error sending welcome email:', error);
    }
};

// sendWelcomeEmail("Aakarsh");

const sendPasswordResetEmail = async (user, resetToken) => {
    try {
        await resend.emails.send({
            from: 'XY Essentials <noreply@xyessentials.com>',
            to: user.email,
            subject: 'Password Reset Request',
            html: `
                <h1>Password Reset Request</h1>
                <p>Hi ${user.name},</p>
                <p>You requested to reset your password.</p>
                <p>Click here to reset: <a href="http://localhost:5173/reset-password/${resetToken}">Reset Password</a></p>
                <p>If you didn't request this, please ignore this email.</p>
            `
        });
    } catch (error) {
        console.error('Error sending password reset email:', error);
    }
};

module.exports = {
    sendOrderConfirmation,
    sendOrderStatusUpdate,
    sendWelcomeEmail,
    sendPasswordResetEmail
};
