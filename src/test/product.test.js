import prismaClient from "../application/database.js";
import request from "supertest";
import { depth } from "../application/logging.js";
import { createProductImageTest, createProductTest, createUserTest, loginUserTest } from "./test-util.js";
import { web } from "../application/web.js";

describe("POST /api/products", () => {

    beforeEach(async () => {
        await prismaClient.orderDetail.deleteMany();
        await prismaClient.order.deleteMany();
        await prismaClient.productPhoto.deleteMany();
        await prismaClient.product.deleteMany();
        await prismaClient.user.deleteMany();
        await createUserTest("yazid", "0895600436143", "password", "ADMIN");
    })

    it("should success create product", async () => {

        const userLogin = await loginUserTest("0895600436143", "password");

        const response = await request(web).post("/api/products")
            .set("Authorization", `Bearer ${userLogin.body.data.accessToken}`)
            .set("Content-Type", "multipart/form-data")
            .field("name", "dimsum ayam")
            .field("description", "dimsum ayam segar")
            .field("price", 28000)
            .field("stock", 20)
            .attach("photo", __dirname + "/product_dimsum/image.png")
            .attach("photo", __dirname + "/product_dimsum/image2.png")

        depth(response.body)

        expect(response.status).toBe(201);
        expect(response.body.data.id).toBeDefined();
        expect(response.body.data.name).toBe("dimsum ayam");
        expect(response.body.data.price).toBe(28000);
        expect(response.body.data.stock).toBe(20);

    })

    it("should reject if price or stock is null", async () => {

        const userLogin = await loginUserTest("0895600436143", "password");

        const response = await request(web).post("/api/products")
            .set("Authorization", `Bearer ${userLogin.body.data.accessToken}`)
            .set("Content-Type", "multipart/form-data")
            .field("name", "dimsum ayam")
            .field("description", "dimsum ayam segar")
            .attach("photo", __dirname + "/product_dimsum/image.png")
            .attach("photo", __dirname + "/product_dimsum/image2.png")

        depth(response.body)

        expect(response.status).toBe(400);
        expect(response.body.errors).toBeDefined();

    })

    it("should reject if not upload photo product", async () => {

        const userLogin = await loginUserTest("0895600436143", "password");

        const response = await request(web).post("/api/products")
            .set("Authorization", `Bearer ${userLogin.body.data.accessToken}`)
            .set("Content-Type", "multipart/form-data")
            .field("name", "dimsum ayam")
            .field("description", "dimsum ayam segar")
            .field("price", 28000)
            .field("stock", 20)

        depth(response.body)

        expect(response.status).toBe(400);
        expect(response.body.errors).toBeDefined();

    })

    it("should reject if file extension invalid", async () => {

        const userLogin = await loginUserTest("0895600436143", "password");

        const response = await request(web).post("/api/products")
            .set("Authorization", `Bearer ${userLogin.body.data.accessToken}`)
            .set("Content-Type", "multipart/form-data")
            .field("name", "dimsum ayam")
            .field("description", "dimsum ayam segar")
            .field("price", 28000)
            .field("stock", 20)
            .attach("photo", __dirname + "/product_dimsum/image.png")
            .attach("photo", __dirname + "/product_dimsum/text.txt")

        depth(response.body)

        expect(response.status).toBe(400);
        expect(response.body.errors).toBeDefined();

    })

    it("should reject if name product already exist", async () => {

        const userLogin = await loginUserTest("0895600436143", "password");
        const createProduct = await createProductTest("dimsum ayam")

        const response = await request(web).post("/api/products")
            .set("Authorization", `Bearer ${userLogin.body.data.accessToken}`)
            .set("Content-Type", "multipart/form-data")
            .field("name", "dimsum ayam")
            .field("description", "dimsum ayam segar")
            .field("price", 28000)
            .field("stock", 20)
            .attach("photo", __dirname + "/product_dimsum/image.png")
            .attach("photo", __dirname + "/product_dimsum/image.png")

        depth(response.body)

        expect(response.status).toBe(400);
        expect(response.body.errors).toBeDefined();

    })

})

describe("PATCH /api/products/productId", () => {

    beforeEach(async () => {
        await prismaClient.orderDetail.deleteMany();
        await prismaClient.order.deleteMany();
        await prismaClient.user.deleteMany();
        await prismaClient.productPhoto.deleteMany();
        await prismaClient.product.deleteMany();
        await createUserTest("yazid", "0895600436143", "password", "ADMIN");
    })

    it("should success update data name product", async () => {

        const userLogin = await loginUserTest("0895600436143", "password");
        const product = await createProductTest("dimsum ayam");

        const response = await request(web).patch(`/api/products/${product.id}`)
            .set("authorization", `Bearer ${userLogin.body.data.accessToken}`)
            .set("Content-Type", "application/json")
            .send({
                name: "Dimsum udang keju"
            });

        depth(response.body);

        expect(response.status).toBe(200);
        expect(response.body.data.name).toBe("Dimsum udang keju");

    })

    it("should success update data price product", async () => {

        const userLogin = await loginUserTest("0895600436143", "password");
        const product = await createProductTest("dimsum ayam");

        const response = await request(web).patch(`/api/products/${product.id}`)
            .set("authorization", `Bearer ${userLogin.body.data.accessToken}`)
            .set("Content-Type", "application/json")
            .send({
                price: 40000
            });

        depth(response.body);

        expect(response.status).toBe(200);
        expect(response.body.data.price).toBe(40000);

    })

    it("should reject if request body invalid", async () => {

        const userLogin = await loginUserTest("0895600436143", "password");
        const product = await createProductTest("dimsum ayam");

        const response = await request(web).patch(`/api/products/${product.id}`)
            .set("authorization", `Bearer ${userLogin.body.data.accessToken}`)
            .set("Content-Type", "application/json")
            .send({
                price: "dimsum"
            });

        depth(response.body);

        expect(response.status).toBe(400);
        expect(response.body.errors).toBeDefined();
    })

    it("should reject if name is already exist", async () => {

        const userLogin = await loginUserTest("0895600436143", "password");
        const product1 = await createProductTest("dimsum ayam");
        const product2 = await createProductTest("dimsum udang keju");

        const response = await request(web).patch(`/api/products/${product1.id}`)
            .set("authorization", `Bearer ${userLogin.body.data.accessToken}`)
            .set("Content-Type", "application/json")
            .send({
                name: "dimsum udang keju"
            });

        depth(response.body);

        expect(response.status).toBe(400);
        expect(response.body.errors).toBeDefined();
    })
})

describe("GET /api/products", () => {

    beforeEach(async () => {
        await prismaClient.orderDetail.deleteMany();
        await prismaClient.order.deleteMany();
        await prismaClient.user.deleteMany();
        await prismaClient.productPhoto.deleteMany();
        await prismaClient.product.deleteMany();
        await createUserTest("yazid", "0895600436143", "password", "ADMIN");
    })

    it("should success get all products", async () => {

        const userLogin = await loginUserTest("0895600436143", "password");

        for (let i = 1; i < 10; i++) {
            await createProductImageTest(`Dimsum ${i}`, userLogin.body.data.accessToken);
        };

        const response = await request(web).get(`/api/products`)
            .query({
                size: 5
            });

        depth(response.body);

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(5)
    })

})

describe("GET /api/products/productId", () => {

    beforeEach(async () => {
        await prismaClient.orderDetail.deleteMany();
        await prismaClient.order.deleteMany();
        await prismaClient.user.deleteMany();
        await prismaClient.productPhoto.deleteMany();
        await prismaClient.product.deleteMany();
        await createUserTest("yazid", "0895600436143", "password", "ADMIN");
    })

    it("should success get product by id", async () => {

        const userLogin = await loginUserTest("0895600436143", "password");

        const product = await createProductImageTest(`Dimsum 1`, userLogin.body.data.accessToken);

        const response = await request(web).get(`/api/products/${product.body.data.id}`);

        depth(response.body);

        expect(response.status).toBe(200);
        expect(response.body.data.id).toBe(product.body.data.id);
    })

    it("should reject if id invalid", async () => {

        const userLogin = await loginUserTest("0895600436143", "password");

        const product = await createProductImageTest(`Dimsum 1`, userLogin.body.data.accessToken);

        const response = await request(web).get(`/api/products/satu`);

        depth(response.body);

        expect(response.status).toBe(400);
        expect(response.body.errors).toBeDefined();
    })

    it("should reject if id not found", async () => {

        const userLogin = await loginUserTest("0895600436143", "password");

        const product = await createProductImageTest(`Dimsum 1`, userLogin.body.data.accessToken);

        const response = await request(web).get(`/api/products/9999`);

        depth(response.body);

        expect(response.status).toBe(404);
        expect(response.body.errors).toBeDefined();
    })

})

describe("DELETE /api/products/productId", () => {

    beforeEach(async () => {
        await prismaClient.orderDetail.deleteMany();
        await prismaClient.order.deleteMany();
        await prismaClient.user.deleteMany();
        await prismaClient.productPhoto.deleteMany();
        await prismaClient.product.deleteMany();
        await createUserTest("yazid", "0895600436143", "password", "ADMIN");
    })

    it("should success remove product", async () => {

        const userLogin = await loginUserTest("0895600436143", "password");

        const product = await createProductImageTest(`Dimsum 1`, userLogin.body.data.accessToken);

        const response = await request(web).delete(`/api/products/${product.body.data.id}`)
            .set("authorization", `Bearer ${userLogin.body.data.accessToken}`);


        depth(response.body);

        expect(response.status).toBe(200);
        expect(response.body.data).toBe("OK");
    })

    it("should reject remove if id invalid", async () => {

        const userLogin = await loginUserTest("0895600436143", "password");

        const product = await createProductImageTest(`Dimsum 1`, userLogin.body.data.accessToken);

        const response = await request(web).delete(`/api/products/satu`)
            .set("authorization", `Bearer ${userLogin.body.data.accessToken}`);

        depth(response.body);

        expect(response.status).toBe(400);
        expect(response.body.errors).toBeDefined();
    })

    it("should reject remove if id not found", async () => {

        const userLogin = await loginUserTest("0895600436143", "password");

        const product = await createProductImageTest(`Dimsum 1`, userLogin.body.data.accessToken);

        const response = await request(web).delete(`/api/products/9999`)
            .set("authorization", `Bearer ${userLogin.body.data.accessToken}`);

        depth(response.body);

        expect(response.status).toBe(404);
        expect(response.body.errors).toBeDefined();
    })

})

describe("GET /api/products/statistict", () => {

    beforeEach(async () => {
        await prismaClient.orderDetail.deleteMany();
        await prismaClient.order.deleteMany();
        await prismaClient.productPhoto.deleteMany();
        await prismaClient.product.deleteMany();
        await prismaClient.user.deleteMany();
        await createUserTest("yazid", "0895600436143", "password", "ADMIN");
    });

    it("should success get statistict product", async () => {
        for (let i = 1; i <= 7; i++) {
            await createProductTest(`product ${i}`);
        }

        const customer = await createUserTest("customer", "08153146627", "password");
        const products = await prismaClient.product.findMany({ take: 2 });

        const orders = await prismaClient.order.create({
            data: {
                id: "dqjfw93f09202",
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

        const response = await request(web).get("/api/products/statistict")
            .query({
                date_start: new Date(year, month, day, 0, 0, 0, 0),
                date_end: new Date(year, month, day, 23, 59, 59, 999)
            })

        depth(response.body);

        expect(response.status).toBe(200);
    })

})

describe("DELETE /api/products/productId/photo/photoProduct", () => {

    beforeEach(async () => {
        await prismaClient.orderDetail.deleteMany();
        await prismaClient.order.deleteMany();
        await prismaClient.productPhoto.deleteMany();
        await prismaClient.product.deleteMany();
        await prismaClient.user.deleteMany();
        await createUserTest("yazid", "0895600436143", "password", "ADMIN");
    })

    it("should success remove photo product", async () => {
        const adminLogin = await loginUserTest("0895600436143", "password");
        const product = await createProductImageTest("Dimsum Mentai", adminLogin.body.data.accessToken);

        const photoProduct = await prismaClient.productPhoto.findFirst();

        const response = await request(web).delete(`/api/products/${photoProduct.product_id}/photo/${photoProduct.id}`)
            .set("authorization", `Bearer ${adminLogin.body.data.accessToken}`);

        console.info(response.body);

        expect(response.status).toBe(200);
        expect(response.body.data).toBe("OK");
    })

    it("should reject if photo product not found", async () => {
        const adminLogin = await loginUserTest("0895600436143", "password");
        const product = await createProductImageTest("Dimsum Mentai", adminLogin.body.data.accessToken);

        const response = await request(web).delete(`/api/products/999/photo/9999`)
            .set("authorization", `Bearer ${adminLogin.body.data.accessToken}`);

        console.info(response.body);

        expect(response.status).toBe(404);
        expect(response.body.errors).toBeDefined();
    })

    it("should reject if id product and id photo product invalid", async () => {
        const adminLogin = await loginUserTest("0895600436143", "password");
        const product = await createProductImageTest("Dimsum Mentai", adminLogin.body.data.accessToken);

        const response = await request(web).delete(`/api/products/null/photo/null`)
            .set("authorization", `Bearer ${adminLogin.body.data.accessToken}`);

        console.info(response.body);

        expect(response.status).toBe(400);
        expect(response.body.errors).toBeDefined();
    })

})