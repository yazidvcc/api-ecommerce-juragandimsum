import Joi from "joi";

const createUserValidation = Joi.object({
    first_name: Joi.string().max(50).required(),
    last_name: Joi.string().max(50).optional(),
    username: Joi.string().min(3).max(15).pattern(/^[a-z][a-z0-9_]{2,19}$/).required(),
    password: Joi.string().max(255).required(),
    confirm_password: Joi.string().required().valid(Joi.ref("password")).messages({
        "any.only": "password and confirm password must be same"
    })
});

const loginUserValidation = Joi.object({
    username: Joi.string().min(3).max(15).pattern(/^[a-z][a-z0-9_]{2,19}$/).required(),
    password: Joi.string().max(255).required()
});

export {
    createUserValidation,
    loginUserValidation
}