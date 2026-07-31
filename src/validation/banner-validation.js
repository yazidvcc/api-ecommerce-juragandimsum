import Joi from "joi";

const createBannerValidation = Joi.object({
    url: Joi.string().optional(),
    name: Joi.string().optional(),
    description: Joi.string().optional()
})

const idBannerValidation = Joi.number().positive().required();

const updateBannerValidation = Joi.object({
    id: Joi.number().positive().required(),
    url: Joi.string().optional(),
    name: Joi.string().optional(),
    description: Joi.string().optional()
})

export {
    createBannerValidation,
    idBannerValidation,
    updateBannerValidation
}