// src/middleware/errorMiddleware.js

const errorHandler = (err, req, res, next) => {
    console.error("🔥 Error Stack:", err.stack);

    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Mongoose CastError (Bad ID)
    if (err.name === 'CastError') {
        message = `Resource not found. Invalid: ${err.path}`;
        statusCode = 404;
    }

    // Mongoose Duplicate Key
    if (err.code === 11000) {
        message = `Duplicate field value entered`;
        statusCode = 400;
    }

    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
        message = Object.values(err.errors).map(val => val.message).join(', ');
        statusCode = 400;
    }

    res.status(statusCode).json({
        success: false,
        error: message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = errorHandler;