import jwt from "jsonwebtoken";
import { verifyAccessToken } from "../application/token";

const authMiddleware = (req, res, next) => {

    const authHeader = req.get("authorization");
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
        return res.status(401).json({
            errors: "Token invalid"
        });
    };

    try {
        const payload = verifyAccessToken(token);
        req.user = payload;
    } catch (e) {
        const errors = e.name === "TokenExpiredError" ? "Token sudah kadaluwarsa" : "Token tidak valid";
        return res.status(401).json({ errors });
    };

};   

export {
    authMiddleware
};