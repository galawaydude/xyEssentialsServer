const { mg, domain } = require('../config/mailgunConfig');
const templates = require('../utils/mailgunUtil');

class EmailService {
  static isSandboxDomain = domain.includes('sandbox');
  static authorizedRecipients = [
    'aakarshgoyal23@gmail.com'
  ];

  static validateRecipients(recipients) {
    if (!this.isSandboxDomain) return true;

    const unauthorizedRecipients = recipients.filter(
      email => !this.authorizedRecipients.includes(email)
    );

    if (unauthorizedRecipients.length > 0) {
      throw new Error(
        `Unauthorized recipients detected. For sandbox domains, recipients must be authorized first. ` +
        `Unauthorized emails: ${unauthorizedRecipients.join(', ')}`
      );
    }

    return true;
  }

  static async sendWelcomeEmail(to, subject, content) {
    try {
      // Validate recipient for sandbox domain
      this.validateRecipients([to]);
  
      const messageData = {
        from: `XY Essentials <noreply@${domain}>`,
        to: to,
        subject: subject,
        html: content
      };
  
      const response = await mg.messages.create(domain, messageData);
      return response;
    } catch (error) {
      if (error.status === 403) {
        throw new Error(
          `Welcome email sending failed: This domain (${domain}) is a sandbox domain. ` +
          `Please authorize recipients or upgrade to a paid account.`
        );
      }
      throw error;
    }
  }

  static async sendSingleEmail(to, templateName, data) {
    try {
      // Validate recipient for sandbox domain
      this.validateRecipients([to]);

      const template = templates[templateName](data);
      
      const messageData = {
        from: `XY Essentials <noreply@${domain}>`,
        to: to,
        subject: template.subject,
        html: template.html
      };

      const response = await mg.messages.create(domain, messageData);
      return response;
    } catch (error) {
      if (error.status === 403) {
        throw new Error(
          `Email sending failed: This domain (${domain}) is a sandbox domain. ` +
          `Please authorize recipients or upgrade to a paid account.`
        );
      }
      throw error;
    }
  }

  static async sendBulkEmails(recipients, templateName, data) {
    try {
      // Validate all recipients for sandbox domain
      this.validateRecipients(recipients);

      const template = templates[templateName](data);
      const batchSize = 100;
      const results = [];

      // Split recipients into batches
      for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);
        
        const messageData = {
          from: `XY Essentials <noreply@${domain}>`,
          to: batch,
          subject: template.subject,
          html: template.html,
          recipient_variables: batch.reduce((acc, email) => {
            acc[email] = { id: email };
            return acc;
          }, {})
        };

        const response = await mg.messages.create(domain, messageData);
        results.push(response);

        // Add delay between batches to avoid rate limiting
        if (i + batchSize < recipients.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      return results;
    } catch (error) {
      if (error.status === 403) {
        throw new Error(
          `Bulk email sending failed: This domain (${domain}) is a sandbox domain. ` +
          `Please authorize recipients or upgrade to a paid account.`
        );
      }
      throw error;
    }
  }
}

module.exports = EmailService;