import prismaClient from "../application/database.js";
import request from "supertest";
import { web } from "../application/web.js";
import { depth } from "../application/logging.js";
import { createCustomerTest, loginCustomerTest } from "./test-util.js";

describe("POST /api/users", () => {

    beforeEach(async () => {
        await prismaClient.user.deleteMany();
    });

    it("should success create user", async () => {
        
        const response = await request(web).post("/api/users")
            .set("Accept", "application/json")
            .send({
                first_name: "yazid",
                last_name: "khairul",
                phone: "0895600436143",
                password: "password",
                confirm_password: "password"
            });
        
        depth(response.body);

        expect(response.status).toBe(201);
        expect(response.body.data.name).toBe("yazid khairul");
        expect(response.body.data.phone).toBe("0895600436143");

    });

    it("should reject if phone invalid", async () => {
        
        const response = await request(web).post("/api/users")
            .set("Accept", "application/json")
            .send({
                first_name: "yazid",
                last_name: "khairul",
                phone: "0895600436ui3",
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
                phone: "0895600436ui3",
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
                phone: "0895600436ui3",
                password: "password",
                confirm_password: "salah"
            });
        
        depth(response.body);

        expect(response.status).toBe(400);
        expect(response.body.errors).toBeDefined();

    });

    it("should reject if phone already exist", async () => {

        const registerFirst = await createCustomerTest("rizal", "0895600436143", "password");
        
        const response = await request(web).post("/api/users")
            .set("Accept", "application/json")
            .send({
                first_name: "yazid",
                last_name: "khairul",
                phone: "0895600436143",
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
        await prismaClient.user.deleteMany();
    });

    it("should success user login", async () => {

        const userRegister = await createCustomerTest("yazid", "0895600436143", "password")
        
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
        
        const userRegister = await createCustomerTest("yazid", "0895600436143", "password")

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

describe("POST /api/users/logout", () => {

    beforeEach(async () => {
        await prismaClient.user.deleteMany();
    });

    it("should success logout", async () => {
        
        const userRegister = await createCustomerTest("yazid", "0895600436143", "password");
        const loginUser = await loginCustomerTest("0895600436143", "password");

        const response = await request(web).post("/api/users/logout")
            .set("Cookie", loginUser.get("Set-Cookie"));

        depth(response.body);

        expect(response.status).toBe(200);
        expect(response.body.data).toBe("OK")

    })

})

describe("POST /api/users/refresh", () => {

    beforeEach(async () => {
        await prismaClient.user.deleteMany();
    });

    it("should success get new access token", async () => {
        
        const userRegister = await createCustomerTest("yazid", "0895600436143", "password");
        const loginUser = await loginCustomerTest("0895600436143", "password");

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