// services/otpService.js
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString(); // 6-digit OTP
};

const sendOTP = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        auth: {
            user: "work201116@gmail.com",
            pass: "yptfmgyxholycflj",
        },
    });

    const mailOptions = {
        from: '"XY Essentials" <aakarshgoyal23@gmail.com>',
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}. It will expire in 15 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    console.log('OTP email sent to:', email);
};

module.exports = {
    generateOTP,
    sendOTP,
};
