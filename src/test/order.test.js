import prismaClient from "../application/database";
import request from "supertest";
import { createOrderTest, createProductImageTest, createUserTest, loginUserTest, setShippingCost } from "./test-util";
import { web } from "../application/web";
import { depth } from "../application/logging";

describe("POST /api/orders", () => {

    beforeEach(async () => {
        await prismaClient.orderDetail.deleteMany();
        await prismaClient.order.deleteMany();
        await prismaClient.productPhoto.deleteMany();
        await prismaClient.product.deleteMany();
        await prismaClient.user.deleteMany();
        await createUserTest("yazid", "0895600436143", "password", "ADMIN");
        await createUserTest("yazid", "0895600436144", "passwordd", "CUSTOMER");
    });

    it("should success create order product", async () => {
        const adminLogin = await loginUserTest("0895600436143", "password");
        const customerLogin = await loginUserTest("0895600436144", "passwordd");

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

        const response = await request(web).post("/api/orders")
            .set("authorization", `Bearer ${customerLogin.body.data.accessToken}`)
            .set("Content-Type", "application/json")
            .send({
                province: "Sumatera Utara",
                city: "Medan",
                district: "Marelan",
                postal_code: 20250,
                spesifict_address: "Jl.Titi Pahlawan Gg.Pringgan, Lr.Murai",
                product: [
                    {
                        product_id: product1.id,
                        quantity: 10
                    },
                    {
                        product_id: product2.id,
                        quantity: 15
                    }
                ]
            });

        depth(response.body);

        expect(response.status).toBe(201);
        expect(response.body.data).toBeDefined();
    });

    it("should success create order product without postal_code", async () => {
        const adminLogin = await loginUserTest("0895600436143", "password");
        const customerLogin = await loginUserTest("0895600436144", "passwordd");

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

        const response = await request(web).post("/api/orders")
            .set("authorization", `Bearer ${customerLogin.body.data.accessToken}`)
            .set("Content-Type", "application/json")
            .send({
                province: "Sumatera Utara",
                city: "Medan",
                district: "Marelan",
                spesifict_address: "Jl.Titi Pahlawan Gg.Pringgan, Lr.Murai",
                product: [
                    {
                        product_id: product1.id,
                        quantity: 10
                    },
                    {
                        product_id: product2.id,
                        quantity: 15
                    }
                ]
            });

        depth(response.body);

        expect(response.status).toBe(201);
        expect(response.body.data).toBeDefined();
    });

    it("should reject if product_id is not retrive", async () => {
        const adminLogin = await loginUserTest("0895600436143", "password");
        const customerLogin = await loginUserTest("0895600436144", "passwordd");

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

        const response = await request(web).post("/api/orders")
            .set("authorization", `Bearer ${customerLogin.body.data.accessToken}`)
            .set("Content-Type", "application/json")
            .send({
                province: "Sumatera Utara",
                city: "Medan",
                district: "Marelan",
                spesifict_address: "Jl.Titi Pahlawan Gg.Pringgan, Lr.Murai",
                product: [
                    {
                        quantity: 10
                    },
                    {
                        product_id: product2.id,
                        quantity: 15
                    }
                ]
            });

        depth(response.body);

        expect(response.status).toBe(400);
        expect(response.body.errors).toBeDefined();
    });

    it("should reject if product_id is not found", async () => {
        const adminLogin = await loginUserTest("0895600436143", "password");
        const customerLogin = await loginUserTest("0895600436144", "passwordd");

        for (let i = 1; i <= 3; i++) {
            await createProductImageTest(`Dimsum ${i}`, adminLogin.body.data.accessToken);
        };

        const response = await request(web).post("/api/orders")
            .set("authorization", `Bearer ${customerLogin.body.data.accessToken}`)
            .set("Content-Type", "application/json")
            .send({
                province: "Sumatera Utara",
                city: "Medan",
                district: "Marelan",
                spesifict_address: "Jl.Titi Pahlawan Gg.Pringgan, Lr.Murai",
                product: [
                    {
                        product_id: 9999,
                        quantity: 10
                    },
                    {
                        product_id: 8888,
                        quantity: 15
                    }
                ]
            });

        depth(response.body);

        expect(response.status).toBe(404);
        expect(response.body.errors).toBeDefined();
    });

    it("should reject stock product is not enough", async () => {
        const adminLogin = await loginUserTest("0895600436143", "password");
        const customerLogin = await loginUserTest("0895600436144", "passwordd");

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

        const response = await request(web).post("/api/orders")
            .set("authorization", `Bearer ${customerLogin.body.data.accessToken}`)
            .set("Content-Type", "application/json")
            .send({
                province: "Sumatera Utara",
                city: "Medan",
                district: "Marelan",
                spesifict_address: "Jl.Titi Pahlawan Gg.Pringgan, Lr.Murai",
                product: [
                    {
                        product_id: product1.id,
                        quantity: 30
                    },
                    {
                        product_id: product2.id,
                        quantity: 30
                    }
                ]
            });

        depth(response.body);

        expect(response.status).toBe(400);
        expect(response.body.errors).toBeDefined();
    });

})

describe("POST /api/orders/orderId/shipping-cost", () => {

    beforeEach(async () => {
        await prismaClient.orderDetail.deleteMany();
        await prismaClient.order.deleteMany();
        await prismaClient.productPhoto.deleteMany();
        await prismaClient.product.deleteMany();
        await prismaClient.user.deleteMany();
        await createUserTest("yazid", "0895600436143", "password", "ADMIN");
        await createUserTest("yazid", "0895600436144", "passwordd", "CUSTOMER");
    });

    it("should success set shipping cost for order", async () => {
        const adminLogin = await loginUserTest("0895600436143", "password");
        const customerLogin = await loginUserTest("0895600436144", "passwordd");

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

        const response = await request(web).post(`/api/orders/${order.body.data.id}/shipping-cost`)
            .set("authorization", `Bearer ${adminLogin.body.data.accessToken}`)
            .set("Content-Type", "application/json")
            .send({
                shipping_cost: 30000,
                shipping_name: "Bus"
            });

        depth(response.body);

        expect(response.status).toBe(200);
        expect(response.body.data).toBeDefined()
        expect(response.body.data.shipping_cost).toBe(30000);
        expect(response.body.data.shipping_name).toBe("Bus");
    })

    it("should reject if shopping cost is null", async () => {
        const adminLogin = await loginUserTest("0895600436143", "password");
        const customerLogin = await loginUserTest("0895600436144", "passwordd");

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

        const response = await request(web).post(`/api/orders/${order.body.data.id}/shipping-cost`)
            .set("authorization", `Bearer ${adminLogin.body.data.accessToken}`)
            .set("Content-Type", "application/json")
            .send({
                shipping_cost: null,
                shipping_name: "Bus"
            });

        depth(response.body);

        expect(response.status).toBe(400);
        expect(response.body.errors).toBeDefined()
    })

    it("should reject if order id not found", async () => {
        const adminLogin = await loginUserTest("0895600436143", "password");
        const customerLogin = await loginUserTest("0895600436144", "passwordd");

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

        const response = await request(web).post(`/api/orders/not-found/shipping-cost`)
            .set("authorization", `Bearer ${adminLogin.body.data.accessToken}`)
            .set("Content-Type", "application/json")
            .send({
                shipping_cost: 30000,
                shipping_name: "Bus"
            });

        depth(response.body);

        expect(response.status).toBe(404);
        expect(response.body.errors).toBeDefined()
    })
})

describe("POST /api/orders/orderId/payment", () => {

    beforeEach(async () => {
        await prismaClient.orderDetail.deleteMany();
        await prismaClient.order.deleteMany();
        await prismaClient.productPhoto.deleteMany();
        await prismaClient.product.deleteMany();
        await prismaClient.user.deleteMany();
        await createUserTest("yazid", "0895600436143", "password", "ADMIN");
        await createUserTest("yazid", "0895600436144", "passwordd", "CUSTOMER");
    });

    it("should success get token transaction", async () => {
        const adminLogin = await loginUserTest("0895600436143", "password");
        const customerLogin = await loginUserTest("0895600436144", "passwordd");

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

        const response = await request(web).post(`/api/orders/${order.body.data.id}/payment`)
            .set("authorization", `Bearer ${customerLogin.body.data.accessToken}`)

        depth(response.body);

        expect(response.body.data.token).toBeDefined();
        expect(response.body.data.redirect_url).toBeDefined();

    })

    it("should reject if order id not found", async () => {
        const adminLogin = await loginUserTest("0895600436143", "password");
        const customerLogin = await loginUserTest("0895600436144", "passwordd");

        const response = await request(web).post(`/api/orders/9999/payment`)
            .set("authorization", `Bearer ${customerLogin.body.data.accessToken}`)

        depth(response.body);

        expect(response.status).toBe(404);
        expect(response.body.errors).toBeDefined();
    })

    it("should reject if the user pays for an order that is not his ", async () => {
        const adminLogin = await loginUserTest("0895600436143", "password");
        const customerLogin = await loginUserTest("0895600436144", "passwordd");

        await createUserTest("yazid", "0895600436145", "passwordd", "CUSTOMER");
        const customer2Login = await loginUserTest("0895600436145", "passwordd");

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

        const response = await request(web).post(`/api/orders/${order.body.data.id}/payment`)
            .set("authorization", `Bearer ${customer2Login.body.data.accessToken}`)

        depth(response.body);

        expect(response.status).toBe(404);
        expect(response.body.errors).toBeDefined();

    })
})