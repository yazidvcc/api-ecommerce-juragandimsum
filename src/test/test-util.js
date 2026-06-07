import prismaClient from "../application/database.js";
import bcrypt from "bcrypt";
import request from "supertest";
import { web } from "../application/web.js";

const createUserTest = async (name, phone, password, role = "CUSTOMER") => {

    const passwordHash = await bcrypt.hash(password, 10);

    return prismaClient.user.create({
        data: {
            name: name,
            phone: phone,
            password: passwordHash,
            role: role
        }
    });

};

const loginUserTest = async (phone, password) => {
    return request(web).post("/api/users/login")
            .set("Accept", "application/json")
            .send({
                phone: phone,
                password: password
            });
}

const createProductTest = async (name) => {
    return prismaClient.product.create({
        data: {
            name: name,
            description: "Description product",
            price: 20000,
            stock: 30
        }
    });
};

export {
    createUserTest,
    loginUserTest,
    createProductTest
};