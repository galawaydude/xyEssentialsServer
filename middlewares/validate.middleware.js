const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            // If validation fails, return the error details
            return res.status(400).json({
                status: 'error',
                message: 'Validation error',
                details: error.details.map(err => err.message) 
            });
        }
        next();
    };
};

module.exports = validateRequest;
