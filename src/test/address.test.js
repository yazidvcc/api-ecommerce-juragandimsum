import request from "supertest";
import { web } from "../application/web";
import { depth } from "../application/logging";

describe("GET /api/address/province", () => {

    it("should success get data province", async () => {
        const response = await request(web).get("/api/address/province");

        depth(response.body);

        expect(response.status).toBe(200);
        expect(response.body.data).toBeDefined();
    })

})

describe("GET /api/address/city", () => {

    it("should success get data city", async () => {
        const response = await request(web).get("/api/address/city/16");

        depth(response.body);

        expect(response.status).toBe(200);
        expect(response.body.data).toBeDefined();
    })

})

describe("GET /api/address/district", () => {

    it("should success get data district", async () => {
        const response = await request(web).get("/api/address/district/361");

        depth(response.body);

        expect(response.status).toBe(200);
        expect(response.body.data).toBeDefined();
    })

})

describe("GET /api/address/subdistrict", () => {

    it("should success get data subdistrict", async () => {
        const response = await request(web).get("/api/address/subdistrict/3499");

        depth(response.body);

        expect(response.status).toBe(200);
        expect(response.body.data).toBeDefined();
    })

})