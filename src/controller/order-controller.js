import orderService from "../service/order-service.js";

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
        const result = await orderService.shippingCost(req.body);
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

const getNotification = async (req, res, next) => {
    
    try {
        const result = await orderService.getNotification(req.body);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }

};

const search = async (req, res, next) => {
    
    try {
        const result = await orderService.search(req.query, req.user);
        res.status(200).json(result);
    } catch (e) {
        next(e);
    }

};

const get = async (req, res, next) => {
    
    try {
        const orderId = req.params.orderId;
        const result = await orderService.get(orderId);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }

};

const handleStatus = async (req, res, next) => {
    
    try {
        req.body = req.body || {};
        req.body.order_id = req.params.orderId;
        const result = await orderService.handleStatus(req.body, req.user);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }

};

const statistictOder = async (req, res, next) => {
    
    try {
        const result = await orderService.statistictOrder(req.query);
        res.status(200).json({
            data: result
        })
    } catch (e) {
        next(e)
    } 
}

export default {
    create,
    shippingCost,
    tokenTransaction,
    getNotification,
    search,
    get,
    handleStatus,
    statistictOder
};