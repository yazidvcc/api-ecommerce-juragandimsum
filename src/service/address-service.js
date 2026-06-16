import ResponseError from "../error/response-error.js";
import { idAddressValidation } from "../validation/address-validation.js";
import validate from "../validation/validation.js";

const province = async () => {

    const url = 'https://rajaongkir.komerce.id/api/v1/destination/province';
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            key: process.env.RAJAONGKIR_API_KEY
        }
    };

    const response = await fetch(url, options);
    const result = await response.json();

    if (result?.meta?.status === "failed") {
        throw new ResponseError(400, result.meta.message)
    }

    return result.data;

}

const city = async (provinceId) => {

    provinceId = validate(idAddressValidation, provinceId);

    const url = `https://rajaongkir.komerce.id/api/v1/destination/city/${provinceId}`;
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            key: process.env.RAJAONGKIR_API_KEY
        }
    };

    const response = await fetch(url, options);
    const result = await response.json();

    if (result?.meta?.status === "failed") {
        throw new ResponseError(400, result.meta.message)
    }

    return result.data;

}

const district = async (cityId) => {

    cityId = validate(idAddressValidation, cityId);

    const url = `https://rajaongkir.komerce.id/api/v1/destination/district/${cityId}`;
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            key: process.env.RAJAONGKIR_API_KEY
        }
    };

    const response = await fetch(url, options);
    const result = await response.json();

    if (result?.meta?.status === "failed") {
        throw new ResponseError(400, result.meta.message)
    }

    return result.data;

}

const subdistrict = async (districtId) => {

    districtId = validate(idAddressValidation, districtId);

    const url = `https://rajaongkir.komerce.id/api/v1/destination/sub-district/${districtId}`;
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            key: process.env.RAJAONGKIR_API_KEY
        }
    };

    const response = await fetch(url, options);
    const result = await response.json();

    if (result?.meta?.status === "failed") {
        throw new ResponseError(400, result.meta.message)
    }

    return result.data;

}

export default {
    province,
    city,
    district,
    subdistrict
};