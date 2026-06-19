import Joi from "joi";

const createCartValidation = Joi.object({
    product_id: Joi.number().positive().required(),
    quantity: Joi.number().min(1).positive().required()
})

const idCartValidation = Joi.number().positive().required();

const updateCartValidation = Joi.object({
    cart_id: Joi.number().positive().required(),
    quantity: Joi.number().min(1).positive().required()
})

export {
    createCartValidation,
    idCartValidation,
    updateCartValidation
};