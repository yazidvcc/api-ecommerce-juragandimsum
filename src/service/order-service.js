import { createOrderValidation, createShippingCostOrderValidation } from "../validation/order-validation"
import validate from "../validation/validation"
import prismaClient from "../application/database.js";
import { v4 as uuid } from "uuid";
import ResponseError from "../error/response-error.js";

const create = async (request, userId) => {

    request = validate(createOrderValidation, request);

    return await prismaClient.$transaction(async (tx) => {
        let total_price = 0;

        for (const productRequest of request.product) {
            let product = await tx.product.findUnique({
                where: {
                    id: productRequest.product_id
                },
                select: {
                    id: true,
                    stock: true,
                    price: true
                }
            });

            if (!product) {
                throw new ResponseError(404, "Product not found");
            }

            if (product.stock < productRequest.quantity) {
                throw new ResponseError(400, "Stock is not enough");
            }

            total_price += product.price * productRequest.quantity;

            await tx.product.update({
                where: {
                    id: product.id
                },
                data: {
                    stock: {
                        decrement: productRequest.quantity
                    }
                }
            });
        }

        request.id = `${userId}-${new Date().toTimeString().split(" ")[0]}-${uuid()}`;
        request.user = {
            connect: {
                id: userId
            }
        };
        const addressWithoutPostalCode = `${request.spesifict_address}, ${request.district}, ${request.city}, ${request.province}`;
        const addressWithPostalCode = `${request.spesifict_address}, ${request.postal_code}, ${request.district}, ${request.city}, ${request.province}`;
        request.address = request.postal_code ? addressWithPostalCode : addressWithoutPostalCode;
        request.total_price = total_price;
        request.orderDetails = {
            createMany: {
                data: request.product
            }
        };

        delete request.product
        delete request.spesifict_address
        delete request.province
        delete request.city
        delete request.district
        delete request.postal_code

        const order = await tx.order.create({
            data: request,
            select: {
                id: true,
                user_id: true,
                address: true,
                total_price: true,
                status: true
            }
        })

        return order;
    });

};

const shippingCost = async (request) => {
    
    request = validate(createShippingCostOrderValidation, request);

    const product = await prismaClient.order.findUnique({
        where: {
            id: request.order_id
        }
    });

    if (!product) {
        throw new ResponseError(404, "Product is not found");
    }

    delete request.order_id;

    return await prismaClient.order.update({
        where: {
            id: product.id
        },
        data: request,
        select: {
            id: true,
            user_id: true,
            address: true,
            total_price: true,
            shipping_cost: true,
            shipping_name: true,
            status: true
        }
    });

}

export default {
    create,
    shippingCost
};