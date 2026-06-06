import prismaClient from "../application/database.js";
import bcrypt from "bcrypt";
import request from "supertest";
import { web } from "../application/web.js";

const createCustomerTest = async (name, phone, password) => {

    const passwordHash = await bcrypt.hash(password, 10);

    return prismaClient.user.create({
        data: {
            name: name,
            phone: phone,
            password: passwordHash
        }
    });

};

const loginCustomerTest = async (phone, password) => {
    return request(web).post("/api/users/login")
            .set("Accept", "application/json")
            .send({
                phone: phone,
                password: password
            });
}

export {
    createCustomerTest,
    loginCustomerTest
};