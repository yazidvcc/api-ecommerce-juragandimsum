import prismaClient from "../application/database.js";
import request from "supertest";
import { createOrderTest, createProductImageTest, createProductTest, createUserTest, loginUserTest, setShippingCost } from "./test-util.js";
import { web } from "../application/web.js";
import { depth } from "../application/logging.js";

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

        const response = await request(web).post(`/api/orders/999/shipping-cost`)
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

    }, 5000)

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

describe("GET /api/orders", () => {

    beforeEach(async () => {
        await prismaClient.orderDetail.deleteMany();
        await prismaClient.order.deleteMany();
        await prismaClient.productPhoto.deleteMany();
        await prismaClient.product.deleteMany();
        await prismaClient.user.deleteMany();
        await createUserTest("yazid", "0895600436143", "password", "ADMIN");
        await createUserTest("yazid", "0895600436144", "passwordd", "CUSTOMER");
    });

    it("should success search order by customer", async () => {
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
        await setShippingCost(order.body.data.id, adminLogin.body.data.accessToken, 28000);

        const response = await request(web).get("/api/orders")
            .set("authorization", `Bearer ${customerLogin.body.data.accessToken}`)
            
        depth(response.body);

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(1);

    })

    it("should success search order by admin", async () => {
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
        await createUserTest("yazid", "0895600436143", "password", "ADMIN");
        await createUserTest("yazid", "0895600436144", "passwordd", "CUSTOMER");
    });

    it("should success get order by id", async () => {
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
        await setShippingCost(order.body.data.id, adminLogin.body.data.accessToken, 28000);

        const response = await request(web).get(`/api/orders/${order.body.data.id}`)
            .set("authorization", `Bearer ${adminLogin.body.data.accessToken}`)

        depth(response.body);

        expect(response.status).toBe(200);
        expect(response.body.data.id).toBe(order.body.data.id);
    })

    it("should reject if order id is not found", async () => {
        const adminLogin = await loginUserTest("0895600436143", "password");
        const customerLogin = await loginUserTest("0895600436144", "passwordd");

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
        await createUserTest("yazid", "0895600436143", "password", "ADMIN");
        await createUserTest("yazid", "0895600436144", "passwordd", "CUSTOMER");
    });
    
    it("should success set status order by admin", async () => {
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
        await createUserTest("yazid", "0895600436143", "password", "ADMIN");
    });

    it("should success get information statistict", async () => {
        for (let i = 1; i <= 7; i++) {
            await createProductTest(`product ${i}`);
        }

        const customer = await createUserTest("customer", "08153146627", "password");
        const products = await prismaClient.product.findMany({ take: 2});

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

        const adminLogin = await loginUserTest("0895600436143", "password");

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