import prismaClient from "../application/database";
import request from "supertest";
import { depth } from "../application/logging";
import { createProductTest, createUserTest, loginUserTest } from "./test-util";
import { web } from "../application/web";

describe("POST /api/products", () => {

    beforeEach(async () => {
        await prismaClient.user.deleteMany();
        await prismaClient.productPhoto.deleteMany();
        await prismaClient.product.deleteMany();
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