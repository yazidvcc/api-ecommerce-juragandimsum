import userService from "../service/user-service.js"

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
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    };

}

export default {
    create,
    login
};