// src/utils/asyncHandler.js

const asyncHandler = (fn) => {
    return (req, res, next) => {
        // Run the function and catch any errors automatically
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = asyncHandler;