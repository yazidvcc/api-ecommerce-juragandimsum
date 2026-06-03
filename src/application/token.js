import jwt from "jsonwebtoken";

const signAccessToken = async (payload) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN, {
        expiresIn: "60m"
    });
};

const signRefreshToken = async (payload) => {
    return jwt.sign(payload, process.env.REFERSH_TOKEN, {
        expiresIn: "7d"
    });
};

const verifyAccessToken = async (token) => {
    return jwt.verify(token, process.env.ACCESS_TOKEN);
};

const verifyRefreshToken = async (token) => {
    return jwt.verify(token, process.env.REFRESH_TOKEN);
};

export {
    signAccessToken,
    signRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
}