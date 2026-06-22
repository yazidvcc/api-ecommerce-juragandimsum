import prismaClient from "../application/database";
import request from "supertest";
import { web } from "../application/web";
import { createBannerTest, createUserTest, loginUserTest } from "./test-util";
import { depth } from "../application/logging";

describe("POST /api/banners", () => {

    beforeEach(async () => {
        await prismaClient.banner.deleteMany();
        await prismaClient.user.deleteMany();
        await createUserTest("yazid", "0895600436143", "password", "ADMIN");
    })

    it("should success create banner", async () => {
        const adminLogin = await loginUserTest("0895600436143", "password");

        const response = await request(web).post("/api/banners")
            .set("authorization", `Bearer ${adminLogin.body.data.accessToken}`)
            .set("Content-Type", "multipart/form-data")
            .field({
                url: "https://localhost:9000",
                name: "promo diskon"
            })
            .attach("banner", __dirname + "/product_dimsum/image.png");

        depth(response.body);

        expect(response.status).toBe(201);
        expect(response.body.data.url).toBe("https://localhost:9000")
    })

    it("should reject if not receive file photo banner", async () => {
        const adminLogin = await loginUserTest("0895600436143", "password");

        const response = await request(web).post("/api/banners")
            .set("authorization", `Bearer ${adminLogin.body.data.accessToken}`)
            .set("Content-Type", "multipart/form-data")
            .field({
                url: "https://localhost:9000",
                name: "promo diskon"
            })

        depth(response.body);

        expect(response.status).toBe(400);
        expect(response.body.errors).toBeDefined()
    })

    it("should reject if extension or mimetype file invalid", async () => {
        const adminLogin = await loginUserTest("0895600436143", "password");

        const response = await request(web).post("/api/banners")
            .set("authorization", `Bearer ${adminLogin.body.data.accessToken}`)
            .set("Content-Type", "multipart/form-data")
            .field({
                url: "https://localhost:9000",
                name: "promo diskon"
            })
            .attach("banner", __dirname + "/product_dimsum/text.txt");

        depth(response.body);

        expect(response.status).toBe(400);
        expect(response.body.errors).toBeDefined()
    })

    it("should reject if name banner already exist", async () => {
        const adminLogin = await loginUserTest("0895600436143", "password");

        const response1 = await request(web).post("/api/banners")
            .set("authorization", `Bearer ${adminLogin.body.data.accessToken}`)
            .set("Content-Type", "multipart/form-data")
            .field({
                url: "https://localhost:9000",
                name: "promo diskon"
            })
            .attach("banner", __dirname + "/product_dimsum/image.png");

        const response2 = await request(web).post("/api/banners")
            .set("authorization", `Bearer ${adminLogin.body.data.accessToken}`)
            .set("Content-Type", "multipart/form-data")
            .field({
                url: "https://localhost:9000",
                name: "promo diskon"
            })
            .attach("banner", __dirname + "/product_dimsum/image.png");

        depth(response2.body);

        expect(response2.status).toBe(400);
        expect(response2.body.errors).toBeDefined()
    })
})

describe("GET /api/banners", () => {

    beforeEach(async () => {
        await prismaClient.banner.deleteMany();
        await prismaClient.user.deleteMany();
        await createUserTest("yazid", "0895600436143", "password", "ADMIN");
    });

    it("should success search banner", async () => {
        const adminLogin = await loginUserTest("0895600436143", "password");

        for (let i = 1; i < 6; i++) {   
            await createBannerTest(adminLogin.body.data.accessToken, `promo ${i}`)
        }

        const response = await request(web).get("/api/banners");
            
        depth(response.body.data)
        expect(response.status).toBe(200)
        expect(response.body.data.length).toBe(5);
    })

})

describe("DELETE /api/banner/idBanner", () => {

    beforeEach(async () => {
        await prismaClient.banner.deleteMany();
        await prismaClient.user.deleteMany();
        await createUserTest("yazid", "0895600436143", "password", "ADMIN");
    });

    it("should success remove banner", async () => {
        const adminLogin = await loginUserTest("0895600436143", "password");
        
        const banner = await createBannerTest(adminLogin.body.data.accessToken, `promo diskon`);

        const response = await request(web).delete(`/api/banners/${banner.id}`)
            .set("authorization", `Bearer ${adminLogin.body.data.accessToken}`);

        depth(response.body);

        expect(response.status).toBe(200);
        expect(response.body.data).toBe("OK");
    })

    it("should reject if id banner not found", async () => {
        const adminLogin = await loginUserTest("0895600436143", "password");

        const response = await request(web).delete(`/api/banners/9999`)
            .set("authorization", `Bearer ${adminLogin.body.data.accessToken}`);

        depth(response.body);

        expect(response.status).toBe(404);
        expect(response.body.errors).toBeDefined();
    })

    it("should reject if id banner invalid", async () => {
        const adminLogin = await loginUserTest("0895600436143", "password");

        const response = await request(web).delete(`/api/banners/number`)
            .set("authorization", `Bearer ${adminLogin.body.data.accessToken}`);

        depth(response.body);

        expect(response.status).toBe(400);
        expect(response.body.errors).toBeDefined();
    })
})