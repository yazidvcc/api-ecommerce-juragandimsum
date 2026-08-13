import prismaClient from "../application/database.js";
import request from "supertest";
import { web } from "../application/web.js";
import { depth } from "../application/logging.js";
import { createUserTest, loginUserTest } from "./test-util.js";

describe("POST /api/users", () => {

    beforeEach(async () => {
        await prismaClient.orderDetail.deleteMany();
        await prismaClient.order.deleteMany();
        await prismaClient.productPhoto.deleteMany();
        await prismaClient.product.deleteMany();
        await prismaClient.user.deleteMany();
    });

    it("should success create user", async () => {

        const response = await request(web).post("/api/users")
            .set("Accept", "application/json")
            .send({
                first_name: "yazid",
                last_name: "khairul",
                username: "yazidkhairul_",
                password: "password",
                confirm_password: "password"
            });

        depth(response.body);

        expect(response.status).toBe(201);
        expect(response.body.data.name).toBe("yazid khairul");
        expect(response.body.data.username).toBe("yazidkhairul_");

    });

    it("should reject if username invalid", async () => {
        const response = await request(web).post("/api/users")
            .set("Accept", "application/json")
            .send({
                first_name: "yazid",
                last_name: "khairul",
                username: "yaz@khairul",
                password: "password",
                confirm_password: "password"
            });

        depth(response.body);

        expect(response.status).toBe(400);
        expect(response.body.errors).toBeDefined();

    });

    it("should reject if confirm password not same password", async () => {

        const response = await request(web).post("/api/users")
            .set("Accept", "application/json")
            .send({
                first_name: "yazid",
                last_name: "khairul",
                username: "yazidkhairul_",
                password: "password",
                confirm_password: "salah"
            });

        depth(response.body);

        expect(response.status).toBe(400);
        expect(response.body.errors).toBeDefined();

    });

    it("should reject if confirm password not same password", async () => {

        const response = await request(web).post("/api/users")
            .set("Accept", "application/json")
            .send({
                first_name: "yazid",
                last_name: "khairul",
                username: "yazidkhairul_",
                password: "password",
                confirm_password: "salah"
            });

        depth(response.body);

        expect(response.status).toBe(400);
        expect(response.body.errors).toBeDefined();

    });

    it("should reject if username already exist", async () => {

        const registerFirst = await createCustomerTest("rizal", "yazidkhairul_", "password");
        
        const response = await request(web).post("/api/users")
            .set("Accept", "application/json")
            .send({
                first_name: "yazid",
                last_name: "khairul",
                username: "yazidkhairul_",
                password: "password",
                confirm_password: "salah"
            });

        depth(response.body);

        expect(response.status).toBe(400);
        expect(response.body.errors).toBeDefined();

    });

});

describe("POST /api/users/login", () => {

    beforeEach(async () => {
        await prismaClient.orderDetail.deleteMany();
        await prismaClient.order.deleteMany();
        await prismaClient.productPhoto.deleteMany();
        await prismaClient.product.deleteMany();
        await prismaClient.user.deleteMany();
    });

    it("should success user login", async () => {

        const userRegister = await createUserTest("yazid", "0895600436143", "password")

        const response = await request(web).post("/api/users/login")
            .set("Accept", "application/json")
            .send({
                phone: "0895600436143",
                password: "password"
            });

        depth(response.body);

        expect(response.status).toBe(200);
        expect(response.body.data.phone).toBe("0895600436143");

    });

    it("should reject if phone invalid", async () => {

        const response = await request(web).post("/api/users/login")
            .set("Accept", "application/json")
            .send({
                phone: "089560043iuop",
                password: "password"
            });

        depth(response.body);

        expect(response.status).toBe(400);
        expect(response.body.errors).toBeDefined()

    });

    it("should reject if password invalid", async () => {

        const userRegister = await createUserTest("yazid", "0895600436143", "password")

        const response = await request(web).post("/api/users/login")
            .set("Accept", "application/json")
            .send({
                phone: "0895600436143",
                password: "salah"
            });

        depth(response.body);

        expect(response.status).toBe(401);
        expect(response.body.errors).toBeDefined()

    });
});

describe("GET /api/users", () => {

    beforeEach(async () => {
        await prismaClient.orderDetail.deleteMany();
        await prismaClient.order.deleteMany();
        await prismaClient.productPhoto.deleteMany();
        await prismaClient.product.deleteMany();
        await prismaClient.user.deleteMany();
    });

    it("should success get user", async () => {
        const userRegister = await createUserTest("yazid", "0895600436143", "password");

        const userLogin = await loginUserTest("0895600436143", "password");

        const response = await request(web).get("/api/users")
            .set("authorization", `Bearer ${userLogin.body.data.accessToken}`)

        depth(response.body);

        expect(response.status).toBe(200);
        expect(response.body.data.phone).toBe(userLogin.body.data.phone);
    })

    it("should reject if user not login", async () => {
        const userRegister = await createUserTest("yazid", "0895600436143", "password");

        const response = await request(web).get("/api/users")
            .set("authorization", `Bearer asalaja`)

        depth(response.body);

        expect(response.status).toBe(401);
        expect(response.body.errors).toBeDefined()
    })

})

describe("POST /api/users/logout", () => {

    beforeEach(async () => {
        await prismaClient.orderDetail.deleteMany();
        await prismaClient.order.deleteMany();
        await prismaClient.productPhoto.deleteMany();
        await prismaClient.product.deleteMany();
        await prismaClient.user.deleteMany();
    });

    it("should success logout", async () => {

        const userRegister = await createUserTest("yazid", "0895600436143", "password");
        const loginUser = await loginUserTest("0895600436143", "password");

        const response = await request(web).post("/api/users/logout")
            .set("Cookie", loginUser.get("Set-Cookie"));

        depth(response.body);

        expect(response.status).toBe(200);
        expect(response.body.data).toBe("OK")

    })

})

describe("POST /api/users/refresh", () => {

    beforeEach(async () => {
        await prismaClient.orderDetail.deleteMany();
        await prismaClient.order.deleteMany();
        await prismaClient.productPhoto.deleteMany();
        await prismaClient.product.deleteMany();
        await prismaClient.user.deleteMany();
    });

    it("should success get new access token", async () => {

        const userRegister = await createUserTest("yazid", "0895600436143", "password");
        const loginUser = await loginUserTest("0895600436143", "password");

        const response = await request(web).post("/api/users/refresh")
            .set("Cookie", loginUser.get("Set-Cookie"));

        depth(response.body);

        expect(response.status).toBe(200);
        expect(response.body.data.accessToken).toBeDefined()

    });

    it("should reject if refresh token cookie doesn't exist", async () => {

        const response = await request(web).post("/api/users/refresh")

        depth(response.body);

        expect(response.status).toBe(401);
        expect(response.body.errors).toBeDefined()

    });

})