import userService from "../service/user-service.js";

const create = async (req, res, next) => {

    try {
        const result = await userService.create(req.body);
        res.status(201).json({
            data: result
        });
    } catch (e) {
        next(e);
    };

}

const login = async (req, res, next) => {

    try {
        const result = await userService.login(req.body);
        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.status(200).json({
            data: {
                id: result.id,
                username: result.username,
                accessToken: result.accessToken
            }
        });
    } catch (e) {
        next(e);
    };

}

const get = async (req, res, next) => {
    
    try {
        const result = await userService.get(req.user?.id);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }

}

const logout = async (req, res, next) => {

    try {
        const token = req.cookies?.refreshToken;
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        })
        if (token) {
            await userService.logout(token);
        };
        res.status(200).json({
            data: "OK"
        });
    } catch (e) {
        next(e)
    }

}

export default {
    create,
    login,
    get,
    logout
};