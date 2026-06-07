import productService from "../service/product-service"

const create = async (req, res, next) => {
    
    try {
        const result = await productService.create(req.body, req.files);
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