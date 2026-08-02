import Joi from "joi";

const createOrderValidation = Joi.object({
    province: Joi.string().required(),
    city: Joi.string().required(),
    district: Joi.string().required(),
    postal_code: Joi.number().optional(),
    spesifict_address: Joi.string().required(),
    product: Joi.array().items(Joi.object({
        product_id: Joi.number().required(),
        quantity: Joi.number().min(1).positive().required()
    })).required()
});

const createShippingCostOrderValidation = Joi.object({
    order_id: Joi.number().positive().required(),
    shipping_cost: Joi.number().positive().required(),
    shipping_name: Joi.string().required()
});

const idOrderValidation = Joi.number().positive().required();

const searchOrderValidation = Joi.object({
    order_id: Joi.number().positive().optional(),
    phone_user: Joi.string().optional(),
    name_user: Joi.string().optional(),
    address: Joi.string().optional(),
    shipping_name: Joi.string().optional(),
    status: Joi.string().valid("PENDING", "SHIPPED", "DELIVERED", "CANCELLED").optional(),
    payment_status: Joi.string().valid("PENDING", "SUCCESS", "FAILED").optional(),
    date_start: Joi.string().optional(),
    date_end: Joi.string().optional(),
    page: Joi.number().min(1).default(1),
    size: Joi.number().min(1).max(100).default(10)
});

const updateStatusOrderValidation = Joi.object({
    order_id: Joi.number().positive().required(),
    status: Joi.string().valid("PENDING", "SHIPPED", "DELIVERED", "CANCELLED").required()
});

const statistictTime = Joi.object({
    date_start: Joi.date().required(),
    date_end: Joi.date().greater(Joi.ref('date_start')).required(),
});

export {
    createOrderValidation,
    createShippingCostOrderValidation,
    idOrderValidation,
    searchOrderValidation,
    updateStatusOrderValidation,
    statistictTime
};