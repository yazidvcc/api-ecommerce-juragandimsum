import prismaClient from "../application/database";
import ResponseError from "../error/response-error";
import { createProductValidation, updateProductValidation } from "../validation/product-validation";
import validate from "../validation/validation";
import path from "path";
import { v4 as uuid } from "uuid";
import minioClient from "../application/minio";

const create = async (requestBody, requestFile) => {

    requestBody = validate(createProductValidation, requestBody);

    let files = requestFile?.photo;
    if (!files) {
        throw new ResponseError(400, "upload at least one photo");
    }

    files = Array.isArray(files) ? files : [files];

    const allowedExtension = ['.jpg', '.jpeg', '.png', '.webp'];
    const allowedMimeType = ['image/jpeg', 'image/png', 'image/webp'];

    const validatedFiles = [];

    for (const file of files) {
        const fileExtension = path.extname(file.name).toLowerCase();
        const mimeType = file.mimetype;

        const isValidFileExtension = allowedExtension.includes(fileExtension);
        const isValidMimeType = allowedMimeType.includes(mimeType);

        if (!isValidFileExtension || !isValidMimeType) {
            throw new ResponseError(400, `Format file ${file.name} tidak diizinkan`);
        }

        validatedFiles.push({
            name: file.name,
            extension: fileExtension,
            data: file.data,
            size: file.size,
            mimetype: mimeType
        });
    }

    const countInDatabase = await prismaClient.product.count({
        where: {
            name: requestBody.name
        }
    });

    if (countInDatabase > 0) {
        throw new ResponseError(400, "product name is already exist");
    }

    const product = await prismaClient.product.create({
        data: requestBody,
        select: {
            id: true,
            name: true,
            price: true,
            stock: true
        }
    });

    const bucketName = process.env.MINIO_BUCKET_PRODUCT;
    const uploadedObjects = [];

    try {
        await Promise.all(validatedFiles.map(async (file) => {
            const urlFile = `product-${product.id}/${uuid()}${file.extension}`;

            await minioClient.putObject(
                bucketName,
                urlFile,
                file.data,
                file.size,
                {
                    "Content-Type": file.mimetype
                }
            );

            uploadedObjects.push(urlFile);
        }));

        await prismaClient.productPhoto.createMany({
            data: uploadedObjects.map((url) => ({
                product_id: product.id,
                url: url
            }))
        });

        return product;

    } catch (error) {
        console.error("Terjadi kegagalan saat membuat produk. Melakukan rollback data...", error);

        if (uploadedObjects.length > 0) {
            try {
                await Promise.all(uploadedObjects.map(async (fileName) => {
                    await minioClient.removeObject(bucketName, fileName);
                }));
            } catch (minioError) {
                console.error("Gagal menghapus file sampah di MinIO:", minioError);
            }
        }

        try {
            await prismaClient.product.delete({
                where: {
                    id: product.id
                }
            });
        } catch (dbError) {
            console.error("Gagal menghapus record produk di Database:", dbError);
        }

        if (error instanceof ResponseError) {
            throw error;
        }
        throw new ResponseError(500, error.message || "Gagal memproses data produk");
    }
};

const update = async (request) => {

    request = validate(updateProductValidation, request);

    if (!request.name && !request.description && !request.price && !request.stock) {
        throw new ResponseError(400, "not receiving any data")
    }

    const updateProduct = await prismaClient.$transaction(async (tx) => {
        const product = await tx.product.findUnique({
            where: {
                id: request.id
            }
        });

        if (!product) {
            throw new ResponseError(404, "product is not found");
        };

        if (request.name) {
            const countInDatabase = await tx.product.count({
                where: {
                    name: request.name,
                    id: {
                        not: request.id
                    }
                }
            })

            if (countInDatabase > 0) {
                throw new ResponseError(400, "name product already exist");
            }
        };

        return await tx.product.update({
            where: {
                id: product.id,
            },
            data: request
        });
    });

    return updateProduct    

}

export default {
    create,
    update
};
