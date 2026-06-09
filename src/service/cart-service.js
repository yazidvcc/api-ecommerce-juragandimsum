import prismaClient from "../application/database";
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

export default {
    create
};