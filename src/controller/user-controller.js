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

export default {
    create
};