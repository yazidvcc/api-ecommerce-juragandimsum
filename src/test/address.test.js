import request from "supertest";
import { web } from "../application/web.js";
import { depth } from "../application/logging.js";

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
        const response = await request(web).get("/api/address/city/12");

        depth(response.body);

        expect(response.status).toBe(200);
        expect(response.body.data).toBeDefined();
    })

})

describe("GET /api/address/district", () => {

    it("should success get data district", async () => {
        const response = await request(web).get("/api/address/district/12.71");

        depth(response.body);

        expect(response.status).toBe(200);
        expect(response.body.data).toBeDefined();
    })

})

describe("GET /api/address/subdistrict", () => {

    it("should success get data subdistrict", async () => {
        const response = await request(web).get("/api/address/subdistrict/12.71.12");

        depth(response.body);

        expect(response.status).toBe(200);
        expect(response.body.data).toBeDefined();
    })

})