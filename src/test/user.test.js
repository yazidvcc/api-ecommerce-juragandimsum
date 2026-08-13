import prismaClient from "../application/database.js";
import request from "supertest";
import { web } from "../application/web.js";
import { depth } from "../application/logging.js";
import { createCustomerTest } from "./test-util.js";

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