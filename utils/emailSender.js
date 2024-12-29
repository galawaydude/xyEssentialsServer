// utils/emailSender.js
const nodemailer = require('nodemailer');

// Create the transporter
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
    },
});

exports.sendOTP = async (email, otp) => {
    try {
        await transporter.sendMail({
            from: '"Your App" <your-email@example.com>',
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP code is ${otp}. It will expire in 15 minutes.`,
        });
        console.log('OTP email sent');
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw new Error('Failed to send OTP email');
    }
};
