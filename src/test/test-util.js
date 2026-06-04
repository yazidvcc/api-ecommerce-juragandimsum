import prismaClient from "../application/database.js";
import bcrypt from "bcrypt";

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

export {
    createCustomerTest
};