import cartService from "../service/cart-service"

const create = async (req, res, next) => {
    
    try {
        const result = await cartService.create(req.body, req.user.id);
        res.status(201).json({
            data: result
        });
    } catch (e) {
        next(e);
    }

};

const get = async (req, res, next) => {
    
    try {
        const result = await cartService.get(req.user.id);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }

};

const remove = async (req, res, next) => {
    
    try {
        const cartId = parseInt(req.params.cartId);
        const result = await cartService.remove(cartId, req.user.id);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }

};

export default {
    create,
    get,
    remove
};