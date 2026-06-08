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

const update = async (req, res, next) => {
    
    try {
        req.body.id = parseInt(req.params.productId);
        const result = await productService.update(req.body);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }

};

const search = async (req, res, next) => {
    
    try {
        const result = await productService.search(req.query);
        res.status(200).json(result);
    } catch (e) {
        next(e);
    }

};

const get = async (req, res, next) => {
    
    try {
        const productId = parseInt(req.params.productId);
        const result = await productService.get(productId);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }

};

export default {
    create,
    update,
    search,
    get
};