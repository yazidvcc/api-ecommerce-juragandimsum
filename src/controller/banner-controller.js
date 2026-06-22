import bannerService from "../service/banner-service"

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

export default {
    create
}