import request from "supertest";
import prismaClient from "../application/database.js";
import { web } from "../application/web.js";
import { createUserTest, createProductImageTest, loginUserTest, createCartTest, getCartTest } from "./test-util.js";
import { depth } from "../application/logging.js";

describe("POST /api/carts", () => {

    beforeEach(async () => {
        await prismaClient.user.deleteMany();
        await prismaClient.productPhoto.deleteMany();
        await prismaClient.product.deleteMany();
        await createUserTest("yazid", "0895600436143", "password", "ADMIN");
        await createUserTest("yazid", "0895600436144", "passwordd", "CUSTOMER");
    })

    it("should success create add product in cart", async () => {
        const adminLogin = await loginUserTest("0895600436143", "password");
        const createProduct = await createProductImageTest(`Dimsum ayamc`, adminLogin.body.data.accessToken);

        const customerLogin = await loginUserTest("0895600436144", "passwordd");
        
        const response = await request(web).post("/api/carts")
            .set("authorization", `Bearer ${customerLogin.body.data.accessToken}`)
            .set("Content-Type", "application/json")
            .send({
                product_id: createProduct.body.data.id,
                quantity: 10
            });

        depth(response.body);

        expect(response.status).toBe(201);
        expect(response.body.data.user_id).toBe(customerLogin.body.data.id);
        expect(response.body.data.product_id).toBe(createProduct.body.data.id);
        expect(response.body.data.quantity).toBe(10);
    })

    it("should reject add product in cart if quantity 0", async () => {
        const adminLogin = await loginUserTest("0895600436143", "password");
        const createProduct = await createProductImageTest(`Dimsum ayamc`, adminLogin.body.data.accessToken);

        const customerLogin = await loginUserTest("0895600436144", "passwordd");
        
        const response = await request(web).post("/api/carts")
            .set("authorization", `Bearer ${customerLogin.body.data.accessToken}`)
            .set("Content-Type", "application/json")
            .send({
                product_id: createProduct.body.data.id,
                quantity: 0
            });

        depth(response.body);

        expect(response.status).toBe(400);
        expect(response.body.errors).toBeDefined();
    })
    
    it("should reject add if user is not customer", async () => {
        const adminLogin = await loginUserTest("0895600436143", "password");
        const createProduct = await createProductImageTest(`Dimsum ayamc`, adminLogin.body.data.accessToken);

        const response = await request(web).post("/api/carts")
            .set("authorization", `Bearer ${adminLogin.body.data.accessToken}`)
            .set("Content-Type", "application/json")
            .send({
                product_id: createProduct.body.data.id,
                quantity: 10
            });

        depth(response.body);

        expect(response.status).toBe(401);
        expect(response.body.errors).toBeDefined();
    })

    it("should reject add product if product not found", async () => {
        const adminLogin = await loginUserTest("0895600436143", "password");
        const customerLogin = await loginUserTest("0895600436144", "passwordd");
        
        const response = await request(web).post("/api/carts")
            .set("authorization", `Bearer ${customerLogin.body.data.accessToken}`)
            .set("Content-Type", "application/json")
            .send({
                product_id: 9999,
                quantity: 1
            });

        depth(response.body);

        expect(response.status).toBe(404);
        expect(response.body.errors).toBeDefined();
    })

    it("should reject add product if product already in cart", async () => {
        const adminLogin = await loginUserTest("0895600436143", "password");
        const createProduct = await createProductImageTest(`Dimsum ayamc`, adminLogin.body.data.accessToken);

        const customerLogin = await loginUserTest("0895600436144", "passwordd");

        const createCart = await createCartTest(customerLogin.body.data.id, createProduct.body.data.id);
        
        const response = await request(web).post("/api/carts")
            .set("authorization", `Bearer ${customerLogin.body.data.accessToken}`)
            .set("Content-Type", "application/json")
            .send({
                product_id: createProduct.body.data.id,
                quantity: 10
            });

        depth(response.body);

        expect(response.status).toBe(400);
        expect(response.body.errors).toBeDefined();
    })
})

describe("GET /api/carts", () => {

    beforeEach(async () => {
        await prismaClient.user.deleteMany();
        await prismaClient.productPhoto.deleteMany();
        await prismaClient.product.deleteMany();
        await createUserTest("yazid", "0895600436143", "password", "ADMIN");
        await createUserTest("yazid", "0895600436144", "passwordd", "CUSTOMER");
    });

    it("should sucess get list products in cart", async () => {
        const adminLogin = await loginUserTest("0895600436143", "password");
        const customerLogin = await loginUserTest("0895600436144", "passwordd");
        
        let products = [];
        for (let i = 1; i <= 5; i++) {
            const product = await createProductImageTest(`Dimsum ${i}`, adminLogin.body.data.accessToken);
            products.push(product);
        }

        let count = 0
        products.forEach(async product => {
            count++;
            if (count > 3) {
                return
            }
            await createCartTest(customerLogin.body.data.id, product.body.data.id);
        });

        const response = await request(web).get("/api/carts")
            .set("authorization", `Bearer ${customerLogin.body.data.accessToken}`);
        
        depth(response.body);

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(3);
    })

    it("should sucess get list even product is null", async () => {
        const adminLogin = await loginUserTest("0895600436143", "password");
        const customerLogin = await loginUserTest("0895600436144", "passwordd");
        
        let products = [];
        for (let i = 1; i <= 5; i++) {
            const product = await createProductImageTest(`Dimsum ${i}`, adminLogin.body.data.accessToken);
            products.push(product);
        }

        const response = await request(web).get("/api/carts")
            .set("authorization", `Bearer ${customerLogin.body.data.accessToken}`);
        
        depth(response.body);

        expect(response.status).toBe(200);
    })

})

describe("DELETE /api/carts/cartId", () => {

    beforeEach(async () => {
        await prismaClient.user.deleteMany();
        await prismaClient.productPhoto.deleteMany();
        await prismaClient.product.deleteMany();
        await createUserTest("yazid", "0895600436143", "password", "ADMIN");
        await createUserTest("yazid", "0895600436144", "passwordd", "CUSTOMER");
    });

    it("should success remove product from cart", async () => {
        const adminLogin = await loginUserTest("0895600436143", "password");
        const customerLogin = await loginUserTest("0895600436144", "passwordd");
        
        let products = [];
        for (let i = 1; i <= 5; i++) {
            const product = await createProductImageTest(`Dimsum ${i}`, adminLogin.body.data.accessToken);
            products.push(product);
        }

        let count = 0
        products.forEach(async product => {
            count++;
            if (count > 3) {
                return
            }
            await createCartTest(customerLogin.body.data.id, product.body.data.id);
        });

        const cart = await getCartTest(customerLogin.body.data.id);

        const response = await request(web).delete(`/api/carts/${cart.id}`)
            .set("authorization", `Bearer ${customerLogin.body.data.accessToken}`)

        depth(response.body);

        expect(response.status).toBe(200);
        expect(response.body.data).toBe("OK");
    })

    it("should reject if idCart invalid", async () => {
        const adminLogin = await loginUserTest("0895600436143", "password");
        const customerLogin = await loginUserTest("0895600436144", "passwordd");

        const response = await request(web).delete(`/api/carts/number`)
            .set("authorization", `Bearer ${customerLogin.body.data.accessToken}`)

        depth(response.body);

        expect(response.status).toBe(400);
        expect(response.body.errors).toBeDefined();
    })

    it("should reject if id cart not found", async () => {
        const adminLogin = await loginUserTest("0895600436143", "password");
        const customerLogin = await loginUserTest("0895600436144", "passwordd");

        const response = await request(web).delete(`/api/carts/9999`)
            .set("authorization", `Bearer ${customerLogin.body.data.accessToken}`)

        depth(response.body);

        expect(response.status).toBe(404);
        expect(response.body.errors).toBeDefined();
    })
})