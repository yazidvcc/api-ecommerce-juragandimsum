import addressService from "../service/address-service"

const province = async (req, res, next) => {
    
    try {
        const result = await addressService.province();
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }

};

const city = async (req, res, next) => {
    
    try {
        const { provinceId } = req.params;
        const result = await addressService.city(provinceId);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }

};

const district = async (req, res, next) => {
    
    try {
        const { cityId } = req.params;
        const result = await addressService.district(cityId);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }

};

const subdistrict = async (req, res, next) => {
    
    try {
        const { districtId } = req.params;
        const result = await addressService.subdistrict(districtId);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }

};

export default {
    province,
    city,
    district,
    subdistrict
};