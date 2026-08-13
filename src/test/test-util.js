import prismaClient from "../application/database.js";
import bcrypt from "bcrypt";

const createCustomerTest = async (name, username, password) => {

    const passwordHash = await bcrypt.hash(password, 10);

    return prismaClient.user.create({
        data: {
            name: name,
            username: username,
            password: passwordHash
        }
    });

};

export {
    createCustomerTest
};