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

export {
    createProductValidation,
    updateProductValidation
};