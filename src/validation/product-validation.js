import Joi from "joi";

const createProductValidation = Joi.object({
    name: Joi.string().max(100).required(),
    description: Joi.string().required(),
    price: Joi.number().positive().required(),
    stock: Joi.number().positive().required()
});

const updateProductValidation = Joi.object({
    id: Joi.number().positive().required(),
    name: Joi.string().max(100).optional(),
    description: Joi.string().optional(),
    price: Joi.number().positive().optional(),
    stock: Joi.number().positive().optional()
})

const searchProductValidation = Joi.object({
    name: Joi.string().max(100).optional(),
    size: Joi.number().min(1).max(20).default(10).optional(),
    page: Joi.number().min(1).default(1).optional()
});

export {
    createProductValidation,
    updateProductValidation,
    searchProductValidation
};