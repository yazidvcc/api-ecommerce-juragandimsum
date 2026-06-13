import orderService from "../service/order-service"

const create = async (req, res, next) => {
    
    try {
        const result = await orderService.create(req.body, req.user.id);
        res.status(201).json({
            data: result
        });
    } catch (e) {
        next(e);
    }

};

export default {
    create
};