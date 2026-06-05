import jwt from "jsonwebtoken";

const signAccessToken = (payload) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN, {
        expiresIn: "60m"
    });
};

const signRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN, {
        expiresIn: "7d"
    });
};

const verifyAccessToken = (token) => {
    return jwt.verify(token, process.env.ACCESS_TOKEN);
};

const verifyRefreshToken = (token) => {
    return jwt.verify(token, process.env.REFRESH_TOKEN);
};

export {
    signAccessToken,
    signRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
};