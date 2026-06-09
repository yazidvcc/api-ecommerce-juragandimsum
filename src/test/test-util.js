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
        },
        select: {
            id: true
        }
    });
};

const createProductImageTest = async (nameProduct, accessToken) => {

    return await request(web).post("/api/products")
        .set("Authorization", `Bearer ${accessToken}`)
        .set("Content-Type", "multipart/form-data")
        .field("name", nameProduct)
        .field("description", "dimsum ayam segar")
        .field("price", 28000)
        .field("stock", 20)
        .attach("photo", __dirname + "/product_dimsum/image.png")
        .attach("photo", __dirname + "/product_dimsum/image2.png");
        
}

const createCartTest = async (user_id, product_id) => {

    return prismaClient.cart.create({
        data: {
            user_id: user_id,
            product_id: product_id,
            quantity: 5
        }
    });

}

export {
    createUserTest,
    loginUserTest,
    createProductTest,
    createProductImageTest,
    createCartTest
};