import prismaClient from "../application/database.js";
import ResponseError from "../error/response-error.js";
import { idBannerValidation, createBannerValidation, updateBannerValidation } from "../validation/banner-validation.js";
import validate from "../validation/validation.js";
import { v4 as uuid } from "uuid";
import path from "path";
import minioClient from "../application/minio.js";

const create = async (file, requestBody) => {

    requestBody = validate(createBannerValidation, requestBody);

    if (!file) {
        throw new ResponseError(400, "no files uploaded");
    }

    file = Array.isArray(file) ? file[0] : file;
    const fileExtension = path.extname(file.name).toLowerCase();
    const mimeType = file.mimetype;

    const allowedExtension = ['.jpg', '.jpeg', '.png', '.webp'];
    const allowedMimeType = ['image/jpeg', 'image/png', 'image/webp'];

    const isValidFileExtension = allowedExtension.includes(fileExtension);
    const isValidMimeType = allowedMimeType.includes(mimeType);

    if (!isValidFileExtension || !isValidMimeType) {
        throw new ResponseError(400, `Format file ${file.name} tidak diizinkan`);
    }

    if (requestBody.name) {
        const countBannerInDatabase = await prismaClient.banner.count({
            where: { name: requestBody.name }
        });
        if (countBannerInDatabase > 0) {
            throw new ResponseError(400, "name banner is already exist");
        }
        requestBody.path = requestBody.name.replace(/[^a-zA-Z0-9]/g, "") + fileExtension;
    } else {
        requestBody.path = uuid() + fileExtension;
    }

    const bucketBanner = process.env.MINIO_BUCKET_BANNER;

    await minioClient.putObject(
        bucketBanner,
        requestBody.path,
        file.data,
        file.size,
        {
            "Content-Type": file.mimetype
        }
    );

    return await prismaClient.banner.create({
        data: requestBody
    })

}

const get = async (bannerId) => {

    bannerId = validate(idBannerValidation, bannerId);

    const banner = await prismaClient.banner.findUnique({
        where: { id: bannerId }
    });

    if (!banner) {
        throw new ResponseError(404, "Banner is not found");
    }

    if (banner.path) {
        const bucket = process.env.MINIO_BUCKET_BANNER;
        const presignedUrl = await minioClient.presignedGetObject(bucket, banner.path, 60 * 60);
        banner.image_url = presignedUrl;
        delete banner.path;
    }

    return banner;
}

const search = async () => {

    const banners = await prismaClient.banner.findMany();
    const bucket = process.env.MINIO_BUCKET_BANNER;

    return await Promise.all(banners.map(async (banner) => {
        const presignedUrl = await minioClient.presignedGetObject(
            bucket,
            banner.path,
            60 * 60
        );
        return {
            ...banner,
            path: presignedUrl
        }
    }));

}

const remove = async (idBanner) => {

    idBanner = validate(idBannerValidation, idBanner);

    const banner = await prismaClient.banner.findUnique({
        where: { id: idBanner }
    });

    if (!banner) {
        throw new ResponseError(404, "Banner is not found");
    }

    try {
        const bucket = process.env.MINIO_BUCKET_BANNER;
        await minioClient.removeObject(bucket, banner.path);
    } catch (e) {
        throw new ResponseError(500, "Failed to delete object")
    }

    await prismaClient.banner.delete({
        where: { id: idBanner }
    });

    return "OK";
}

const update = async (request, file) => {

    request = validate(updateBannerValidation, request);

    const banner = await prismaClient.banner.findUnique({
        where: { id: request.id }
    });

    if (!banner) {
        throw new ResponseError(404, "Banner is not found");  
    }

    request.path = request.name ? request.name.replace(/[^a-zA-Z0-9]/g, "") + path.extname(banner.path).toLowerCase() : banner.path;

    if (file) {
        file = Array.isArray(file) ? file[0] : file;
        const fileExtension = path.extname(file.name).toLowerCase();
        const mimeType = file.mimetype;

        const allowedExtension = ['.jpg', '.jpeg', '.png', '.webp'];
        const allowedMimeType = ['image/jpeg', 'image/png', 'image/webp'];

        const isValidFileExtension = allowedExtension.includes(fileExtension);
        const isValidMimeType = allowedMimeType.includes(mimeType);

        if (!isValidFileExtension || !isValidMimeType) {
            throw new ResponseError(400, `Format file ${file.name} tidak diizinkan`);
        }

        const bucket = process.env.MINIO_BUCKET_BANNER;

        await minioClient.removeObject(
            bucket,
            banner.path
        );
        await minioClient.putObject(
            bucket,
            request.path,
            file.data,
            file.size,
            file.mimetype
        );
    } else {
        const bucket = process.env.MINIO_BUCKET_BANNER;

        await minioClient.copyObject(
            bucket,
            request.path,
            `/${bucket}/${banner.path}`
        );
        await minioClient.removeObject(
            bucket,
            banner.path
        );
    }

    delete request.id;

    return prismaClient.banner.update({
        data: request,
        where: { id: banner.id }
    });

}

export default {
    create,
    search,
    remove,
    get,
    update
}