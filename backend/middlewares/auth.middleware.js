const jwt = require('jsonwebtoken');
const { error } = require('../utils/response');

module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader)
            return error(res, 401, 'Authorization header missing');

        // Expected format: "Bearer <token>"
        const parts = authHeader.split(' ');

        if (parts.length !== 2 || parts[0] !== 'Bearer')
            return error(res, 401, 'Invalid authorization format');

        const token = parts[1];

        if (!token)
            return error(res, 401, 'Token missing');

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user info to request
        req.user = {
            id: decoded.id,
            email: decoded.email,
            name: decoded.name
        };

        next();
    } catch (err) {
        console.error('Auth Middleware Error:', err);

        if (err.name === 'TokenExpiredError')
            return error(res, 401, 'Token expired');

        if (err.name === 'JsonWebTokenError')
            return error(res, 401, 'Invalid token');

        return error(res, 401, 'Unauthorized');
    }
};
