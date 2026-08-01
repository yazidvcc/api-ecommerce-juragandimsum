import { createOrderValidation, createShippingCostOrderValidation, idOrderValidation, searchOrderValidation, statistictTime, updateStatusOrderValidation } from "../validation/order-validation.js"
import validate from "../validation/validation.js"
import prismaClient from "../application/database.js";
import { v4 as uuid } from "uuid";
import ResponseError from "../error/response-error.js";
import midtransClient from "midtrans-client";
import crypto from "crypto";

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

    const order = await prismaClient.order.findUnique({
        where: {
            id: request.order_id
        }
    });

    if (!order) {
        throw new ResponseError(404, "Order is not found");
    }

    if (order.status !== "PENDING") {
        throw new ResponseError(400, "Can only set shipping cost for pending orders");
    }

    if (order.shipping_cost) {
        throw new ResponseError(400, "Shipping cost already set");
    }

    delete request.order_id;

    return await prismaClient.order.update({
        where: {
            id: order.id
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

const tokenTransaction = async (orderId, userId) => {

    orderId = validate(idOrderValidation, orderId);

    const user = await prismaClient.user.findUnique({
        where: {
            id: userId
        }
    });

    if (!user) {
        throw new ResponseError(404, "User is not found");
    }

    const order = await prismaClient.order.findFirst({
        where: {
            id: orderId,
            user_id: userId
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    phone: true
                }
            },
            orderDetails: {
                select: {
                    id: true,
                    product: {
                        select: {
                            id: true,
                            name: true,
                            price: true
                        }
                    },
                    quantity: true
                }
            }
        }
    });

    if (!order) {
        throw new ResponseError(404, "Order is not found");
    }

    if (order.status === "DELIVERED" || order.status === "CANCELLED") {
        throw new ResponseError(400, "the order has been processed")
    }

    if (order.payment_status === "SUCCESS") {
        throw new ResponseError(400, "Payment already completed for this order")
    }

    const itemDetails = order.orderDetails.map(detail => ({
        id: detail.product.id.toString(),
        price: detail.product.price,
        quantity: detail.quantity,
        name: detail.product.name
    }));

    if (order.shipping_cost) {
        itemDetails.push({
            id: "SHIPPING",
            price: order.shipping_cost,
            quantity: 1,
            name: order.shipping_name || "Shipping"
        });
    }

    let parameter = {
        "transaction_details": {
            "order_id": order.id,
            "gross_amount": order.total_price + (order.shipping_cost || 0)
        },
        "credit_card": {
            "secure": true
        },
        "item_details": itemDetails,
        "customer_details": {
            "first_name": order.user.name,
            "phone": order.user.phone
        }
    }

    let snap = new midtransClient.Snap({
        isProduction: false,
        serverKey: process.env.MIDTRANS_API_KEY
    });

    const response = await snap.createTransaction(parameter);

    return response;

}

const getNotification = async (request) => {

    const hashSignatureKey = crypto
        .createHash('sha512')
        .update(request.order_id + request.status_code + request.gross_amount + process.env.MIDTRANS_API_KEY)
        .digest('hex');

    if (hashSignatureKey !== request.signature_key) {
        throw new ResponseError(403, "Invalid signature key");
    }

    const order = await prismaClient.order.findUnique({
        where: {
            id: request.order_id
        }
    });

    if (!order) {
        throw new ResponseError(404, "Order not found");
    }

    if (order.payment_status === "SUCCESS" || order.payment_status === "FAILED") {
        return {
            message: "Notification has been processed previously"
        };
    }

    const transactionStatus = request.transaction_status;
    const fraudStatus = request.fraud_status;

    if (transactionStatus === "capture" || transactionStatus === "settlement") {
        if (transactionStatus === "capture" && fraudStatus !== "accept") {
            await prismaClient.$transaction(async (tx) => {
                await tx.order.update({
                    where: { id: order.id },
                    data: {
                        payment_type: request.payment_type,
                        payment_status: "FAILED",
                        status: "CANCELLED"
                    }
                });

                await restoreStock(tx, order.id);
            });

            return {
                message: "Transaction flagged as fraud, order cancelled"
            };
        }

        await prismaClient.order.update({
            where: { id: order.id },
            data: {
                payment_type: request.payment_type,
                payment_status: "SUCCESS"
            }
        });

        return {
            message: "Payment successful"
        };

    } else if (transactionStatus === "pending") {
        await prismaClient.order.update({
            where: { id: order.id },
            data: {
                payment_type: request.payment_type,
                payment_status: "PENDING"
            }
        });

        return {
            message: "Payment pending"
        };

    } else if (transactionStatus === "deny" || transactionStatus === "cancel" || transactionStatus === "expire") {
        await prismaClient.$transaction(async (tx) => {
            await tx.order.update({
                where: { id: order.id },
                data: {
                    payment_type: request.payment_type,
                    payment_status: "FAILED",
                    status: "CANCELLED"
                }
            });

            await restoreStock(tx, order.id);
        });

        return {
            message: `Payment ${transactionStatus}`
        };
    }

    throw new ResponseError(400, `Unhandled transaction status: ${transactionStatus}`);

}

const restoreStock = async (tx, orderId) => {
    const orderDetails = await tx.orderDetail.findMany({
        where: { order_id: orderId },
        select: {
            product_id: true,
            quantity: true
        }
    });

    for (const detail of orderDetails) {
        if (detail.product_id) {
            await tx.product.update({
                where: { id: detail.product_id },
                data: {
                    stock: {
                        increment: detail.quantity
                    }
                }
            });
        }
    }
}

const search = async (request, user) => {

    request = validate(searchOrderValidation, request);

    const skip = request.size * (request.page - 1);
    const filters = [];

    if (user.role === "CUSTOMER") {
        filters.push({
            user_id: user.id
        })
    }

    if (request.order_id) {
        filters.push({
            id: request.order_id
        })
    }

    if (request.phone_user) {
        filters.push({
            user: {
                phone: request.phone_user
            }
        })
    }

    if (request.address) {
        filters.push({
            address: {
                contains: request.address
            }
        });
    }


    if (request.name_user) {
        filters.push({
            user: {
                name: request.name_user
            }
        })
    }

    if (request.shipping_name) {
        filters.push({
            shipping_name: request.shipping_name
        })
    }

    if (request.status) {
        filters.push({
            status: request.status
        })
    }

    if (request.payment_status) {
        filters.push({
            payment_status: request.payment_status
        })
    }

    if (request.date_start) {
        let startDate = new Date(request.date_start);
        startDate.setHours(0, 0, 0, 0);
        filters.push({
            createdAt: {
                gte: startDate.toISOString()
            }
        })
    }

    if (request.date_end) {
        let endDate = new Date(request.date_end);
        endDate.setHours(23, 59, 59, 999);
        filters.push({
            createdAt: {
                lte: endDate.toISOString()
            }
        })
    }

    const orders = await prismaClient.order.findMany({
        where: {
            AND: filters
        },
        skip: skip,
        take: request.size,
        orderBy: {
            createdAt: "desc"
        },
        select: {
            id: true,
            user: {
                select: {
                    id: true,
                    name: true,
                    phone: true
                }
            },
            address: true,
            total_price: true,
            shipping_cost: true,
            shipping_name: true,
            payment_status: true,
            status: true,
            orderDetails: {
                select: {
                    product: {
                        select: {
                            name: true,
                            price: true
                        }
                    },
                    quantity: true
                }
            }
        }
    });

    const totalItems = await prismaClient.order.count({
        where: {
            AND: filters
        }
    });

    return {
        data: orders,
        paging: {
            page: request.page,
            total_items: totalItems,
            total_page: Math.ceil(totalItems / request.size)
        }
    };

}

const get = async (orderId) => {

    orderId = validate(idOrderValidation, orderId);

    const order = await prismaClient.order.findUnique({
        where: { id: orderId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    phone: true
                }
            },
            orderDetails: {
                select: {
                    product: {
                        select: {
                            name: true,
                            price: true
                        }
                    },
                    quantity: true
                }
            }
        }
    });

    if (!order) {
        throw new ResponseError(404, "Order is not found");
    }

    return order;

}

const VALID_TRANSITIONS = {
    "PENDING": ["SHIPPED", "CANCELLED"],
    "SHIPPED": ["DELIVERED"],
    "DELIVERED": [],
    "CANCELLED": []
};

const handleStatus = async (request, user) => {
    request = validate(updateStatusOrderValidation, request);

    const order = await prismaClient.order.findFirst({
        where: { id: request.order_id }
    });

    if (!order) {
        throw new ResponseError(404, "Order is not found");
    }

    if (request.status === "SHIPPED" && order.payment_status !== "SUCCESS") {
        throw new ResponseError(400, "Cannot ship order: payment not completed");
    }

    const allowedNextStatus = VALID_TRANSITIONS[order.status];
    if (!allowedNextStatus.includes(request.status)) {
        throw new ResponseError(400, `Cannot change status from ${order.status} to ${request.status}`);
    }

    if (user.role === "CUSTOMER") {
        if (order.user_id !== user.id) {
            throw new ResponseError(403, "Not your order");
        }
        if (request.status === "SHIPPED" || request.status === "PENDING") {
            throw new ResponseError(403, "your request invalid");
        }
        if (request.status === "CANCELLED") {
            if (order.status !== "PENDING") {
                throw new ResponseError(403, "cannot cancel order unless it is still pending");
            }
            if (order.payment_status === "SUCCESS") {
                throw new ResponseError(400, "cannot cancel order because payment has been completed");
            }
        }
    }

    return await prismaClient.order.update({
        where: { id: request.order_id },
        data: { status: request.status }
    });
};

const statistictOrder = async (request) => {

    request = validate(statistictTime, request);

    const stastictOrder = await prismaClient.order.aggregate({
        _count: {
            id: true,
        },
        _sum: {
            total_price: true
        },
        _avg: {
            total_price: true
        },
        where: {
            AND: [
                {
                    updatedAt: {
                        gte: request.date_start,
                        lte: request.date_end
                    }
                },
                {
                    payment_status: {
                        equals: "SUCCESS"
                    }
                }
            ]
        }
    });

    const totalOrder = stastictOrder._count.id;
    const totalRevenue = stastictOrder._sum.total_price;
    const averageTransactionValue = stastictOrder._avg.total_price;

    return {
        total_order: totalOrder,
        total_revenue: totalRevenue,
        average_transaction_value: averageTransactionValue,
    }
}

export default {
    create,
    shippingCost,
    tokenTransaction,
    getNotification,
    search,
    get,
    handleStatus,
    statistictOrder
};