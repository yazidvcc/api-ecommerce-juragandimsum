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

const createCartTest = async (userId, productId, quantity = 5) => {

    return prismaClient.cart.create({
        data: {
            user_id: userId,
            product_id: productId,
            quantity: quantity
        }
    });

}

const getCartTest = async (userId) => {
    
    return prismaClient.cart.findFirst({
        where: {
            user_id: userId
        }
    });

};

export {
    createUserTest,
    loginUserTest,
    createProductTest,
    createProductImageTest,
    createCartTest,
    getCartTest
};