import prismaClient from "../application/database";
import minioClient from "../application/minio.js";
import ResponseError from "../error/response-error";
import { createCartValidation } from "../validation/cart-validation";
import validate from "../validation/validation.js";

const create = async (request, userId) => {

    request = validate(createCartValidation, request);

    const countUser = await prismaClient.user.count({
        where: {
            id: userId
        }
    });

    if (countUser === 0) {
        throw new ResponseError(404, "user is not found");
    };

    const countProduct = await prismaClient.product.count({
        where: {
            id: request.product_id
        }
    });

    if (countProduct === 0) {
        throw new ResponseError(404, "product is not found");
    };

    const isCartAvailable = await prismaClient.cart.count({
        where: {
            user_id: userId,
            product_id: request.product_id
        }
    });

    if (isCartAvailable > 0) {
        throw new ResponseError(400, "product already exist in cart");
    };

    request.user_id = userId;

    return prismaClient.cart.create({
        data: request
    });

}

const get = async (userId) => {

    const carts = await prismaClient.cart.findMany({
        where: {
            user_id: userId
        },
        select: {
            id: true,
            quantity: true,
            product: {
                select: {
                    name: true,
                    price: true,
                    productPhoto: {
                        select: {
                            url: true
                        },
                        take: 1
                    }
                }
            }
        }
    });

    const cartFinals = await Promise.all(carts.map(async (cart) => {
        if (cart.product.productPhoto.length === 0) {
            return {
                id: cart.id,
                quantity: cart.quantity,
                product_name: cart.product.name,
                product_price: cart.product.price,
                product_photo_url: null
            };
        };

        const bucket = process.env.MINIO_BUCKET_PRODUCT;
        const presignedUrl = await minioClient.presignedGetObject(bucket, cart.product.productPhoto[0].url, 60 * 60);

        return {
            id: cart.id,
            quantity: cart.quantity,
            product_name: cart.product.name,
            product_price: cart.product.price,
            product_photo_url: presignedUrl
        };
    }));

    return cartFinals;

};

export default {
    create,
    get
};