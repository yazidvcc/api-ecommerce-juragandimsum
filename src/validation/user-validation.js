import Joi from "joi";

const createUserValidation = Joi.object({
    first_name: Joi.string().max(50).required(),
    last_name: Joi.string().max(50).optional(),
    phone: Joi.string().min(11).max(13).pattern(/^[0-9]+$/).required(),
    password: Joi.string().max(255).required(),
    confirm_password: Joi.string().required().valid(Joi.ref("password")).messages({
        "any.only": "password and confirm password must be same"
    })
});

export {
    createUserValidation
}