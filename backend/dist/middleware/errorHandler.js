"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (error, req, res, next) => {
    let { statusCode = 500, message } = error;
    // Default error message for 500 errors
    if (statusCode === 500 && message === 'Internal Server Error') {
        message = 'Something went wrong';
    }
    // Log error for debugging
    console.error(`Error ${statusCode}: ${message}`);
    console.error(error.stack);
    res.status(statusCode).json({
        success: false,
        error: {
            code: error.name || 'INTERNAL_ERROR',
            message,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
        },
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map