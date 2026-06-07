const roleMiddleware = (requiredRole) => {
    return (req, res, next) => {
        if (!req.user || !requiredRole.includes(req.user.role)) {
            return res.status(401).json({
                errors: "Insufficient permission"
            });
        };
        next();
    };
};

export default roleMiddleware;