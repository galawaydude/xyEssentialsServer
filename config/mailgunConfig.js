const formData = require('form-data');
const Mailgun = require('mailgun.js');

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY,
  url: "https://api.mailgun.net"
});

const domain = process.env.MAILGUN_DOMAIN;

module.exports = { mg, domain };