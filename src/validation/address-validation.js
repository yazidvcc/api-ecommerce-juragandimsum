import Joi from "joi";

const idAddressValidation = Joi.number().positive().required();

export{
    idAddressValidation
};