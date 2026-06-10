import ResponseError from "../error/response-error.js";

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