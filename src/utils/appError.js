// src/utils/appError.js

class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        
        // Capture stack trace to help debug where the error happened
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;