import prismaClient from "../application/database";
import { signAccessToken, verifyRefreshToken } from "../application/token";
import ResponseError from "../error/response-error";

const refresh = async (req, res, next) => {

    try {
        const token = req.cookies?.refreshToken;

        if (!token) {
            throw new ResponseError(401, "Refresh token not found");
        };

        const tokenExist = await prismaClient.user.count({
            where: {
                token: token
            }
        });

        if (tokenExist === 0) {
            throw new ResponseError(401, "Refresh token invalid");
        };

        const payload = verifyRefreshToken(token);
        const newAccessToken = signAccessToken({
            id: payload.id,
            phone: payload.phone
        });
        
        return res.status(200).json({
            data: {
                accessToken: newAccessToken
            }
        });
    } catch (e) {
        if (!(e instanceof ResponseError)) {
            e = new ResponseError(401, "Refresh token kadaluwarsa");
        };
        next(e);
    };

};

export default {
    refresh
};