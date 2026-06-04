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