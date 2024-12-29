const EmailService = require('../services/mailgunService');
const User = require('../models/user.model');
class EmailController {
    // Send welcome email to a single user
    static async sendWelcomeEmail(req, res) {
        try {
            const { email, name } = req.body;

            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is required'
                });
            }

            const emailContent = `
                <h1>Welcome ${name || 'User'}!</h1>
                <p>Thank you for joining our platform. We're excited to have you on board!</p>
                <p>Get started by exploring our features...</p>
            `;

            const response = await EmailService.sendWelcomeEmail(
                email,
                'Welcome to Our Platform',
                emailContent
            );

            res.status(200).json({
                success: true,
                message: 'Welcome email sent successfully',
                data: response
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to send welcome email',
                error: error.message
            });
        }
    }

    // Send bulk email to all users
    static async sendBulkEmail(req, res) {
        try {
            const { subject, content } = req.body;

            // Input validation
            if (!subject || !content) {
                return res.status(400).json({
                    success: false,
                    message: 'Subject and content are required'
                });
            }

            // Fetch user emails
            const users = await User.find().select('email');
            const recipients = users.map(user => user.email);

            if (recipients.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No recipients found'
                });
            }

            // Send emails
            const response = await EmailService.sendEmail(
                recipients,
                subject,
                content
            );

            return res.status(200).json({
                success: true,
                message: `Email sent successfully to ${recipients.length} users`,
                data: response
            });
        } catch (error) {
            console.error('Bulk email error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to send bulk email',
                error: error.message
            });
        }
    }

    // Send email to specific users
    static async sendCustomEmail(req, res) {
        try {
            const { recipients, subject, content } = req.body;

            if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Recipients array is required and cannot be empty'
                });
            }

            if (!subject || !content) {
                return res.status(400).json({
                    success: false,
                    message: 'Subject and content are required'
                });
            }

            const response = await EmailService.sendEmail(
                recipients,
                subject,
                content
            );

            res.status(200).json({
                success: true,
                message: `Email sent successfully to ${recipients.length} recipients`,
                data: response
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to send custom email',
                error: error.message
            });
        }
    }

    // Send email to filtered users
    static async sendFilteredEmail(req, res) {
        try {
            const { subject, content, filters } = req.body;

            if (!subject || !content) {
                return res.status(400).json({
                    success: false,
                    message: 'Subject and content are required'
                });
            }

            // Apply filters to get specific users
            const query = filters || {};
            const users = await User.find(query).select('email');
            const recipients = users.map(user => user.email);

            if (recipients.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No recipients found matching the filters'
                });
            }

            const response = await EmailService.sendEmail(
                recipients,
                subject,
                content
            );

            res.status(200).json({
                success: true,
                message: `Email sent successfully to ${recipients.length} filtered users`,
                data: response
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to send filtered email',
                error: error.message
            });
        }
    }
}

module.exports = EmailController;