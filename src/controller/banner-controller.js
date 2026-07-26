import bannerService from "../service/banner-service.js";

const create = async (req, res, next) => {
    
    try {
        const result = await bannerService.create(req.files?.banner, req.body);
        res.status(201).json({
            data: result
        });
    } catch (e) {
        next(e)
    }

}

const get = async (req, res, next) => {
    
    try {
        const bannerId = parseInt(req.params?.bannerId);
        const result = await bannerService.get(bannerId);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }

}

const search = async (req, res, next) => {
    
    try {
        const result = await bannerService.search();
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const remove = async (req, res, next) => {
    
    try {
        const idBanner = parseInt(req.params?.idBanner);
        const result = await bannerService.remove(idBanner);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

export default {
    create,
    search,
    remove,
    get
}