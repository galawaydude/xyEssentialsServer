const templates = {
    welcome: (username) => ({
      subject: 'Welcome to Our Platform!',
      html: `
        <h1>Welcome ${username}!</h1>
        <p>Thank you for joining our platform. We're excited to have you on board!</p>
      `
    }),
    
    newsletter: (content) => ({
      subject: 'Monthly Newsletter',
      html: `
        <div style="max-width: 600px; margin: 0 auto;">
          <h2>Newsletter</h2>
          ${content}
        </div>
      `
    }),
  
    bulkNotification: (message) => ({
      subject: 'Important Update',
      html: `
        <div style="max-width: 600px; margin: 0 auto;">
          <h2>Important Update</h2>
          <p>${message}</p>
        </div>
      `
    })
  };
  
  module.exports = templates;