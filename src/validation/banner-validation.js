import Joi from "joi";

const createBannerValidation = Joi.object({
    url: Joi.string().optional(),
    name: Joi.string().optional(),
    description: Joi.string().optional()
})

const idBannerValidation = Joi.number().positive().required();

export {
    createBannerValidation,
    idBannerValidation
}