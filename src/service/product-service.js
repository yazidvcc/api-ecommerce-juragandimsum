import prismaClient from "../application/database.js";
import ResponseError from "../error/response-error.js";
import { createProductValidation, idPhotoProductValidation, idProductValidation, searchProductValidation, statistictTime, updateProductValidation } from "../validation/product-validation.js";
import validate from "../validation/validation.js";
import path from "path";
import { v4 as uuid } from "uuid";
import minioClient from "../application/minio.js";

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

    if (request.name === undefined && request.description === undefined && request.price === undefined && request.stock === undefined) {
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

const search = async (request) => {

    request = validate(searchProductValidation, request);

    const skip = request.size * (request.page - 1);

    const filter = {};
    if (request.name) {
        filter.name = request.name
    }

    const products = await prismaClient.product.findMany({
        where: filter,
        skip: skip,
        take: request.size,
        include: {
            productPhoto: {
                select: {
                    url: true
                },
                take: 1
            }
        }
    });

    const finalProducts = await Promise.all(products.map(async product => {
        if (product.productPhoto.length === 0) {
            delete product.productPhoto
            return {
                ...product,
                photo_url: null
            }
        }

        const bucket = process.env.MINIO_BUCKET_PRODUCT;
        const presignedUrl = await minioClient.presignedGetObject(bucket, product.productPhoto[0].url, 60 * 60);

        delete product.productPhoto

        return {
            ...product,
            photo_url: presignedUrl
        };
    }))

    const countProduct = await prismaClient.product.count({
        where: filter
    });

    return {
        data: finalProducts,
        paging: {
            page: request.page,
            total_page: Math.ceil(countProduct / request.size),
            total_items: countProduct
        }
    };

}

const get = async (productId) => {

    productId = validate(idProductValidation, productId);

    const product = await prismaClient.product.findUnique({
        where: {
            id: productId
        },
        include: {
            productPhoto: true
        }
    });

    if (!product) {
        throw new ResponseError(404, "product not found")
    };

    if (product.productPhoto.length > 0) {
        const urlPhotos = await Promise.all(product.productPhoto.map(
            async (path) => {
                const bucket = process.env.MINIO_BUCKET_PRODUCT;
                const presignedUrl = await minioClient.presignedGetObject(bucket, path.url, 60 * 60);

                return {
                    id: path.id,
                    url: presignedUrl
                };
            }));

        product.productPhoto = urlPhotos;
        product.url_photos = urlPhotos.map((photo) => photo.url);
    }

    return product;

}

const remove = async (productId) => {

    productId = validate(idProductValidation, productId);

    const product = await prismaClient.product.findUnique({
        where: {
            id: productId
        },
        include: {
            productPhoto: true
        }
    });

    if (!product) {
        throw new ResponseError(404, "product not found")
    };

    const bucket = process.env.MINIO_BUCKET_PRODUCT;
    await Promise.all(product.productPhoto.map(async (photo) => {
        try {
            await minioClient.removeObject(bucket, photo.url);
        } catch (err) {
            console.error(`Failed to delete MinIO object: ${photo.url}`, err);
        }
    }));

    await prismaClient.product.delete({
        where: {
            id: productId
        }
    });

    return "OK";

}

const statistictProduct = async (request) => {

    request = validate(statistictTime, request);

    const totalProductSold = await prismaClient.orderDetail.groupBy({
        by: ["product_id"],
        _sum: {
            quantity: true
        },
        where: {
            AND: [
                {
                    createdAt: {
                        gte: request.date_start,
                        lte: request.date_end
                    }
                },
                {
                    order: {
                        OR: [
                            {
                                status: {
                                    equals: "DELIVERED"
                                }
                            },
                            {
                                status: {
                                    equals: "SHIPPED"
                                }
                            }
                        ]
                    }
                }
            ]
        }
    })

    const products = await prismaClient.product.findMany({
        select: {
            id: true,
            name: true,
            stock: true
        }
    });

    const productSoldStatistict = products.map(product => {
        for (const index in totalProductSold) {
            if (product.id === totalProductSold[index].product_id) {
                product.sold = totalProductSold[index]._sum.quantity;
                delete totalProductSold[index];
                return product;
            }
        }
        product.sold = 0;
        return product;
    })

    return {
        product_sold: productSoldStatistict
    }

}

const removePhoto = async (requestParams) => {

    const idProduct = validate(idProductValidation, requestParams.productId);
    const idPhotoProduct = validate(idPhotoProductValidation, requestParams.photoProductId);

    const productPhoto = await prismaClient.productPhoto.findFirst({
        where: {
            AND: [
                {
                    id: idPhotoProduct
                },
                {
                    product_id: idProduct
                }
            ]
        }
    })

    if (!productPhoto) {
        throw new ResponseError(404, "product photo not found");
    }

    const bucket = process.env.MINIO_BUCKET_PRODUCT;
    await minioClient.removeObject(bucket, productPhoto.url);

    await prismaClient.productPhoto.delete({
        where: {
            id: productPhoto.id
        }
    });

    return "OK";

}

const createPhoto = async (productId, requestFile) => {

    productId = validate(idProductValidation, productId);

    let files = requestFile?.photo;
    if (!files) {
        throw new ResponseError(400, "upload at least one photo");
    }

    files = Array.isArray(files) ? files : [files];

    const allowedExtension = ['.jpg', '.jpeg', '.png', '.webp'];
    const allowedMimeType = ['image/jpeg', 'image/png', 'image/webp'];

    files.forEach(file => {
        const fileExtension = path.extname(file.name).toLowerCase();
        const mimeType = file.mimetype;

        const isValidFileExtension = allowedExtension.includes(fileExtension);
        const isValidMimeType = allowedMimeType.includes(mimeType);

        if (!isValidFileExtension || !isValidMimeType) {
            throw new ResponseError(400, `Format file ${file.name} tidak diizinkan`);
        }
    });

    const countInDatabase = await prismaClient.product.count({
        where: {
            id: productId
        }
    });

    if (countInDatabase === 0) {
        throw new ResponseError(404, "product not found");
    }

    const bucket = process.env.MINIO_BUCKET_PRODUCT;
    const uploadedObjects = [];

    try {
        await Promise.all(files.map(async (file) => {
            const urlFile = `product-${productId}/${uuid()}${path.extname(file.name).toLowerCase()}`;

            await minioClient.putObject(
                bucket,
                urlFile,
                file.data,
                file.size,
                {
                    "Content-Type": file.mimetype
                }
            );

            uploadedObjects.push({
                product_id: productId,
                url: urlFile
            })
        }));

        await prismaClient.productPhoto.createMany({
            data: uploadedObjects
        })
    } catch (e) {
        if (uploadedObjects.length > 0) {
            await Promise.all(uploadedObjects.map(async (fileName) => {
                await minioClient.removeObject(bucketName, fileName);
            }));
        }

        await prismaClient.productPhoto.deleteMany({
            where: {
                OR: uploadedObjects.maps(data => ({ url: data.url }))
            }
        })
    }

    const result = await prismaClient.product.findUnique({
        where: {
            id: productId
        },
        include: {
            productPhoto: {
                select: {
                    id: true,
                    url: true
                }
            }
        }
    });

    if (result && result.productPhoto && result.productPhoto.length > 0) {
        const urlPhotos = await Promise.all(result.productPhoto.map(
            async (photo) => {
                const presignedUrl = await minioClient.presignedGetObject(bucket, photo.url, 60 * 60);
                return {
                    id: photo.id,
                    url: presignedUrl
                };
            }
        ));
        result.product_photo = urlPhotos;
        delete result.productPhoto 
    }

    return result;

}

export default {
    create,
    update,
    search,
    get,
    remove,
    statistictProduct,
    removePhoto,
    createPhoto
};
