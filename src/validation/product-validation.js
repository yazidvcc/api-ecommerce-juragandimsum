import Joi from "joi";

const createProductValidation = Joi.object({
    name: Joi.string().max(100).required(),
    description: Joi.string().required(),
    price: Joi.number().positive().required(),
    stock: Joi.number().positive().required()
});

export {
    createProductValidation
};