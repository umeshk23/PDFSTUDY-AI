import { validationResult } from 'express-validator';

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
        return next();
    }

    return res.status(400).json({
        success: false,
        error: 'Validation failed',
        statusCode: 400,
        details: errors.array().map(({ msg, path, value }) => ({
            field: path,
            message: msg,
            value,
        })),
    });
};

export default validateRequest;
