// // services/emailService.js
// const sgMail = require('@sendgrid/mail');

// // Load the SendGrid API Key from your environment variables
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// // Function to send an email
// const sendEmail = async ({ to, subject, text, html }) => {
//   const msg = {
//     to, // recipient email
//     from: process.env.SENDGRID_FROM_EMAIL, // Your verified sender email
//     subject,
//     text,  // Text version of the email
//     html,  // HTML version of the email
//   };

//   try {
//     await sgMail.send(msg);
//     console.log('Email sent successfully');
//   } catch (error) {
//     console.error('Error sending email:', error);
//     if (error.response) {
//       console.error(error.response.body);
//     }
//   }
// };

// module.exports = sendEmail;
