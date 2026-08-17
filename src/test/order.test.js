import prismaClient from "../application/database.js";
import request from "supertest";
import { createOrderTest, createProductImageTest, createProductTest, createUserTest, loginUserTest, setShippingCost } from "./test-util.js";
import { web } from "../application/web.js";
import { depth } from "../application/logging.js";

describe("POST /api/orders", () => {

    beforeEach(async () => {
        await prismaClient.orderDetail.deleteMany();
        await prismaClient.order.deleteMany();
        await prismaClient.cart.deleteMany();
        await prismaClient.productPhoto.deleteMany();
        await prismaClient.product.deleteMany();
        await prismaClient.user.deleteMany();
        await createUserTest("yazid", "Yazidadmin_", "password", "ADMIN");
        await createUserTest("yazid", "Yazidmitra_", "passwordd", "CUSTOMER");
    });

    it("should success create order product", async () => {
        const adminLogin = await loginUserTest("Yazidadmin_", "password");
        const customerLogin = await loginUserTest("Yazidmitra_", "passwordd");

        for (let i = 1; i <= 3; i++) {
            await createProductTest(`Dimsum ${i}`);
        };

        const product1 = await prismaClient.product.findFirst({
            where: {
                name: "Dimsum 1"
            }
        });
        const product2 = await prismaClient.product.findFirst({
            where: {
                name: "Dimsum 2"
            }
        });

        const cart1 = await prismaClient.cart.createMany({
            data: [
                {
                    user_id: customerLogin.body.data.id,
                    product_id: product1.id,
                    quantity: 10
                },
                {
                    user_id: customerLogin.body.data.id,
                    product_id: product2.id,
                    quantity: 15
                }
            ]
        });

        const response = await request(web).post("/api/orders")
            .set("authorization", `Bearer ${customerLogin.body.data.accessToken}`)
            .set("Content-Type", "application/json")
            .send({
                province: "Sumatera Utara",
                city: "Medan",
                district: "Marelan",
                sub_district: "Paya pasir"
            });

        depth(response.body);

        expect(response.status).toBe(201);
        expect(response.body.data).toBeDefined();
    });

    it("should reject if cart is empty", async () => {
        const adminLogin = await loginUserTest("Yazidadmin_", "password");
        const customerLogin = await loginUserTest("Yazidmitra_", "passwordd");


        const response = await request(web).post("/api/orders")
            .set("authorization", `Bearer ${customerLogin.body.data.accessToken}`)
            .set("Content-Type", "application/json")
            .send({
                province: "Sumatera Utara",
                city: "Medan",
                district: "Marelan",
                sub_district: "Paya pasir"
            });

        depth(response.body);

        expect(response.status).toBe(404);
        expect(response.body.errors).toBeDefined();
    });

    it("should reject if quantity more than stock", async () => {
        const adminLogin = await loginUserTest("Yazidadmin_", "password");
        const customerLogin = await loginUserTest("Yazidmitra_", "passwordd");

        for (let i = 1; i <= 3; i++) {
            await createProductTest(`Dimsum ${i}`);
        };

        const product1 = await prismaClient.product.findFirst({
            where: {
                name: "Dimsum 1"
            }
        });
        const product2 = await prismaClient.product.findFirst({
            where: {
                name: "Dimsum 2"
            }
        });

        const cart1 = await prismaClient.cart.createMany({
            data: [
                {
                    user_id: customerLogin.body.data.id,
                    product_id: product1.id,
                    quantity: 100
                },
                {
                    user_id: customerLogin.body.data.id,
                    product_id: product2.id,
                    quantity: 150
                }
            ]
        });

        const response = await request(web).post("/api/orders")
            .set("authorization", `Bearer ${customerLogin.body.data.accessToken}`)
            .set("Content-Type", "application/json")
            .send({
                province: "Sumatera Utara",
                city: "Medan",
                district: "Marelan",
                sub_district: "paya pasir",
            });

        depth(response.body);

        expect(response.status).toBe(400);
        expect(response.body.errors).toBeDefined();
    });

})

describe("GET /api/orders", () => {

    beforeEach(async () => {
        await prismaClient.orderDetail.deleteMany();
        await prismaClient.order.deleteMany();
        await prismaClient.productPhoto.deleteMany();
        await prismaClient.product.deleteMany();
        await prismaClient.user.deleteMany();
        await createUserTest("yazid", "Yazidadmin_", "password", "ADMIN");
        await createUserTest("yazid", "Yazidmitra_", "passwordd", "CUSTOMER");
    });

    it("should success search order by customer", async () => {
        const adminLogin = await loginUserTest("Yazidadmin_", "password");
        const customerLogin = await loginUserTest("Yazidmitra_", "passwordd");

        for (let i = 1; i <= 3; i++) {
            await createProductImageTest(`Dimsum ${i}`, adminLogin.body.data.accessToken);
        };

        const product1 = await prismaClient.product.findFirst({
            where: {
                name: "Dimsum 1"
            }
        });
        const product2 = await prismaClient.product.findFirst({
            where: {
                name: "Dimsum 2"
            }
        });

        const order = await createOrderTest(customerLogin.body.data.accessToken, { product_id: product1.id, quantity: 10 }, { product_id: product2.id, quantity: 10 });
        await setShippingCost(order.body.data.id, adminLogin.body.data.accessToken, 28000);

        const response = await request(web).get("/api/orders")
            .set("authorization", `Bearer ${customerLogin.body.data.accessToken}`)

        depth(response.body);

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(1);

    })

    it("should success search order by admin", async () => {
        const adminLogin = await loginUserTest("Yazidadmin_", "password");
        const customerLogin = await loginUserTest("Yazidmitra_", "passwordd");

        for (let i = 1; i <= 3; i++) {
            await createProductImageTest(`Dimsum ${i}`, adminLogin.body.data.accessToken);
        };

        const product1 = await prismaClient.product.findFirst({
            where: {
                name: "Dimsum 1"
            }
        });
        const product2 = await prismaClient.product.findFirst({
            where: {
                name: "Dimsum 2"
            }
        });

        const order = await createOrderTest(customerLogin.body.data.accessToken, { product_id: product1.id, quantity: 10 }, { product_id: product2.id, quantity: 10 });
        await setShippingCost(order.body.data.id, adminLogin.body.data.accessToken, 28000);

        const response = await request(web).get("/api/orders")
            .set("authorization", `Bearer ${adminLogin.body.data.accessToken}`)

        depth(response.body);

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(1);

    })

})

describe("GET /api/orders/orderId", () => {

    beforeEach(async () => {
        await prismaClient.orderDetail.deleteMany();
        await prismaClient.order.deleteMany();
        await prismaClient.productPhoto.deleteMany();
        await prismaClient.product.deleteMany();
        await prismaClient.user.deleteMany();
        await createUserTest("yazid", "Yazidadmin_", "password", "ADMIN");
        await createUserTest("yazid", "Yazidmitra_", "passwordd", "CUSTOMER");
    });

    it("should success get order by id", async () => {
        const adminLogin = await loginUserTest("Yazidadmin_", "password");
        const customerLogin = await loginUserTest("Yazidmitra_", "passwordd");

        for (let i = 1; i <= 3; i++) {
            await createProductImageTest(`Dimsum ${i}`, adminLogin.body.data.accessToken);
        };

        const product1 = await prismaClient.product.findFirst({
            where: {
                name: "Dimsum 1"
            }
        });
        const product2 = await prismaClient.product.findFirst({
            where: {
                name: "Dimsum 2"
            }
        });

        const order = await createOrderTest(customerLogin.body.data.accessToken, { product_id: product1.id, quantity: 10 }, { product_id: product2.id, quantity: 10 });
        await setShippingCost(order.body.data.id, adminLogin.body.data.accessToken, 28000);

        const response = await request(web).get(`/api/orders/${order.body.data.id}`)
            .set("authorization", `Bearer ${adminLogin.body.data.accessToken}`)

        depth(response.body);

        expect(response.status).toBe(200);
        expect(response.body.data.id).toBe(order.body.data.id);
    })

    it("should reject if order id is not found", async () => {
        const adminLogin = await loginUserTest("Yazidadmin_", "password");
        const customerLogin = await loginUserTest("Yazidmitra_", "passwordd");

        const response = await request(web).get(`/api/orders/999`)
            .set("authorization", `Bearer ${adminLogin.body.data.accessToken}`)

        depth(response.body);

        expect(response.status).toBe(404);
        expect(response.body.errors).toBeDefined();
    })

})

describe("POST /api/orders/orderId/status", () => {

    beforeEach(async () => {
        await prismaClient.orderDetail.deleteMany();
        await prismaClient.order.deleteMany();
        await prismaClient.productPhoto.deleteMany();
        await prismaClient.product.deleteMany();
        await prismaClient.user.deleteMany();
        await createUserTest("yazid", "Yazidadmin_", "password", "ADMIN");
        await createUserTest("yazid", "Yazidmitra_", "passwordd", "CUSTOMER");
    });

    it("should success set status order by admin", async () => {
        const adminLogin = await loginUserTest("Yazidadmin_", "password");
        const customerLogin = await loginUserTest("Yazidmitra_", "passwordd");

        for (let i = 1; i <= 3; i++) {
            await createProductImageTest(`Dimsum ${i}`, adminLogin.body.data.accessToken);
        };

        const product1 = await prismaClient.product.findFirst({
            where: {
                name: "Dimsum 1"
            }
        });
        const product2 = await prismaClient.product.findFirst({
            where: {
                name: "Dimsum 2"
            }
        });

        const order = await createOrderTest(customerLogin.body.data.accessToken, { product_id: product1.id, quantity: 10 }, { product_id: product2.id, quantity: 10 });
        const shippingCost = await setShippingCost(order.body.data.id, adminLogin.body.data.accessToken, 28000);

        const response = await request(web).post(`/api/orders/${order.body.data.id}/status`)
            .set("authorization", `Bearer ${adminLogin.body.data.accessToken}`)
            .set("Content-Type", "application/json")
            .send({
                status: "SHIPPED"
            });

        depth(response.body);

        expect(response.status).toBe(200);
        expect(response.body.data).toBeDefined();
    })

    it("should success set status order by customer", async () => {
        const adminLogin = await loginUserTest("Yazidadmin_", "password");
        const customerLogin = await loginUserTest("Yazidmitra_", "passwordd");

        for (let i = 1; i <= 3; i++) {
            await createProductImageTest(`Dimsum ${i}`, adminLogin.body.data.accessToken);
        };

        const product1 = await prismaClient.product.findFirst({
            where: {
                name: "Dimsum 1"
            }
        });
        const product2 = await prismaClient.product.findFirst({
            where: {
                name: "Dimsum 2"
            }
        });

        const order = await createOrderTest(customerLogin.body.data.accessToken, { product_id: product1.id, quantity: 10 }, { product_id: product2.id, quantity: 10 });
        const shippingCost = await setShippingCost(order.body.data.id, adminLogin.body.data.accessToken, 28000);

        const adminResponse = await request(web).post(`/api/orders/${order.body.data.id}/status`)
            .set("authorization", `Bearer ${adminLogin.body.data.accessToken}`)
            .set("Content-Type", "application/json")
            .send({
                status: "SHIPPED"
            });

        const customerResponse = await request(web).post(`/api/orders/${order.body.data.id}/status`)
            .set("authorization", `Bearer ${customerLogin.body.data.accessToken}`)
            .set("Content-Type", "application/json")
            .send({
                status: "DELIVERED"
            });

        depth(customerResponse.body);

        expect(customerResponse.status).toBe(200);
        expect(customerResponse.body.data).toBeDefined();
    })

    it("should reject cancelling order by customer when payment has already been completed", async () => {
        const adminLogin = await loginUserTest("Yazidadmin_", "password");
        const customerLogin = await loginUserTest("Yazidmitra_", "passwordd");

        for (let i = 1; i <= 3; i++) {
            await createProductImageTest(`Dimsum ${i}`, adminLogin.body.data.accessToken);
        };

        const product1 = await prismaClient.product.findFirst({
            where: {
                name: "Dimsum 1"
            }
        });

        const order = await createOrderTest(customerLogin.body.data.accessToken, { product_id: product1.id, quantity: 10 });
        await prismaClient.order.update({
            where: { id: order.body.data.id },
            data: { payment_status: "SUCCESS" }
        });

        const response = await request(web).post(`/api/orders/${order.body.data.id}/status`)
            .set("authorization", `Bearer ${customerLogin.body.data.accessToken}`)
            .set("Content-Type", "application/json")
            .send({
                status: "CANCELLED"
            });

        depth(response.body);

        expect(response.status).toBe(400);
        expect(response.body.errors).toBeDefined();
    })

})

describe("GET /api/orders/statistict", () => {

    beforeEach(async () => {
        await prismaClient.orderDetail.deleteMany();
        await prismaClient.order.deleteMany();
        await prismaClient.productPhoto.deleteMany();
        await prismaClient.product.deleteMany();
        await prismaClient.user.deleteMany();
        await createUserTest("yazid", "Yazidadmin_", "password", "ADMIN");
    });

    it("should success get information statistict", async () => {
        for (let i = 1; i <= 7; i++) {
            await createProductTest(`product ${i}`);
        }

        const customer = await createUserTest("customer", "08153146627", "password");
        const products = await prismaClient.product.findMany({ take: 2 });

        const orders = await prismaClient.order.create({
            data: {
                user_id: customer.id,
                address: "Jl. Titi Pahlawan",
                total_price: 1000000,
                payment_status: "SUCCESS",
                payment_type: "OVO",
                shipping_cost: 20000,
                shipping_name: "BUS",
                status: "DELIVERED",
                orderDetails: {
                    createMany: {
                        data: [
                            {
                                product_id: products[0].id,
                                quantity: 25
                            },
                            {
                                product_id: products[1].id,
                                quantity: 30
                            }
                        ]
                    }
                }
            }
        })

        const adminLogin = await loginUserTest("Yazidadmin_", "password");

        const date = new Date();
        const month = date.getMonth();
        const day = date.getDate();
        const year = date.getFullYear();

        const response = await request(web).get("/api/orders/statistict")
            .set("authorization", `Bearer ${adminLogin.body.data.accessToken}`)
            .query({
                date_start: new Date(year, month, day, 0, 0, 0, 0),
                date_end: new Date(year, month, day, 23, 59, 59, 999)
            })

        depth(response.body);

        expect(response.status).toBe(200);
    })
})