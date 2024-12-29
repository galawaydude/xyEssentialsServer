const { google } = require('googleapis');


// Load environment variables
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

// Log the environment variables
// console.log('Google Client ID:', GOOGLE_CLIENT_ID);
// console.log('Google Client Secret:', GOOGLE_CLIENT_SECRET);
// console.log('Google Redirect URI:', GOOGLE_REDIRECT_URI);

// Create OAuth2 client
const oauth2client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    'postmessage' 
);

module.exports = { oauth2client };
