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

export default {
    create
};