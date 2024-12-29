// controllers/email.controller.js
const sendEmail = require('../services/emailService');

// Example: Sending Order Confirmation Email
const sendOrderConfirmation = async (req, res) => {
  const { order, user } = req.body;

  try {
    const emailContent = {
      to: user.email,
      subject: 'Order Confirmation',
      text: `Hello ${user.name}, your order has been placed successfully!`,
      html: `<p>Hello <strong>${user.name}</strong>, your order #<strong>${order.id}</strong> has been placed successfully!</p>`
    };

    await sendEmail(emailContent);
    res.status(200).json({ success: true, message: 'Order confirmation email sent successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send order confirmation email.' });
  }
};

// Example: Sending Newsletter Signup Confirmation
const sendNewsletterSignup = async (req, res) => {
  const { email } = req.body;

  try {
    const emailContent = {
      to: email,
      subject: 'Thank you for subscribing!',
      text: 'You are now subscribed to our newsletter!',
      html: '<h1>Thank you for subscribing!</h1>'
    };

    await sendEmail(emailContent);
    res.status(200).json({ success: true, message: 'Newsletter signup confirmation sent!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send newsletter signup email.' });
  }
};

// Example: Sending a Promotion Email (Bulk)
const sendPromotionEmail = async (req, res) => {
  const { emails, promotion } = req.body;

  try {
    const emailContent = {
      to: emails, // Array of emails for bulk sending
      subject: promotion.subject,
      text: promotion.text,
      html: promotion.html
    };

    await sendEmail(emailContent);
    res.status(200).json({ success: true, message: 'Promotional emails sent successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send promotional emails.' });
  }
};

module.exports = {
  sendOrderConfirmation,
  sendNewsletterSignup,
  sendPromotionEmail
};
