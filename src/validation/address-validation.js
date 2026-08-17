import Joi from "joi";

const idAddressValidation = Joi.alternatives().try(
    Joi.string().required(),
    Joi.number().positive().required()
).required();

export {
    idAddressValidation
};