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

const shippingCost = async (req, res, next) => {
    
    try {
        req.body.order_id = req.params.orderId;
        const result = await orderService.shippingCost(req.body, req.user.id);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }

};

const tokenTransaction = async (req, res, next) => {
    
    try {
        const result = await orderService.tokenTransaction(req.params.orderId, req.user.id);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }

};

export default {
    create,
    shippingCost,
    tokenTransaction
};