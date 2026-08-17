import ResponseError from "../error/response-error.js";
import { idAddressValidation } from "../validation/address-validation.js";
import validate from "../validation/validation.js";

const province = async () => {

    const url = 'https://wilayah.id/api/provinces.json';
    const options = {
        method: 'GET'
    };

    const response = await fetch(url, options);
    const result = await response.json();

    return result;

}

const city = async (provinceId) => {

    provinceId = validate(idAddressValidation, provinceId);

    const url = `https://wilayah.id/api/regencies/${provinceId}.json`;
    const options = {
        method: 'GET'
    };

    const response = await fetch(url, options);
    const result = await response.json();

    return result.data;

}

const district = async (cityId) => {

    cityId = validate(idAddressValidation, cityId);

    const url = `https://wilayah.id/api/districts/${cityId}.json`;
    const options = {
        method: 'GET'
    };

    const response = await fetch(url, options);
    const result = await response.json();

    return result.data;

}

const subdistrict = async (districtId) => {

    const url = `https://wilayah.id/api/villages/${districtId}.json`;
    const options = {
        method: 'GET'
    };

    const response = await fetch(url, options);
    const result = await response.json();

    return result.data;

}

export default {
    province,
    city,
    district,
    subdistrict
};