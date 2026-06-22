import Joi from "joi";

const urlValidation = Joi.object({
    url: Joi.string().optional(),
    name: Joi.string().optional(),
})

const idBannerValidation = Joi.number().positive().required();

export {
    urlValidation,
    idBannerValidation
}