import Joi from "joi";

const createOrderValidation = Joi.object({
    province: Joi.string().required(),
    city: Joi.string().required(),
    district: Joi.string().required(),
    postal_code: Joi.number().optional(),
    spesifict_address: Joi.string().required(),
    product: Joi.array().items(Joi.object({
        product_id: Joi.number().required(),
        quantity: Joi.number().required()
    })).required()
});

const createShippingCostOrderValidation = Joi.object({
    order_id: Joi.string().required(),
    shipping_cost: Joi.number().positive().required(),
    shipping_name: Joi.string().required()
});

export {
    createOrderValidation,
    createShippingCostOrderValidation
};