const morgan = require('morgan');

// Logging middleware using Morgan (development only)
const logger = (app) => {
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }
};

module.exports = { logger };
