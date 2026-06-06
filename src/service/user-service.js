import validate from "../validation/validation.js";
import prismaClient from "../application/database.js";
import ResponseError from "../error/response-error.js";
import bcrypt from "bcrypt";
import { createUserValidation, loginUserValidation } from "../validation/user-validation.js";
import { signAccessToken, signRefreshToken } from "../application/token.js";

const create = async (request) => {

    request = validate(createUserValidation, request);

    const countInDatabase = await prismaClient.user.count({
        where: {
            phone: request.phone
        }
    });

    if (countInDatabase > 0) {
        throw new ResponseError(400, "phone is already exist");
    };

    request.password = await bcrypt.hash(request.password, 10);
    request.name = request.first_name + " " + request.last_name;
    request.role = "CUSTOMER";

    delete request.first_name;
    delete request.last_name;
    delete request.confirm_password;

    return prismaClient.user.create({
        data: request,
        select: {
            id: true,
            name: true,
            phone: true
        }
    });

}

const login = async (request) => {

    request = validate(loginUserValidation, request);

    const user = await prismaClient.user.findUnique({
        where: {
            phone: request.phone
        }
    });

    if (!user) {
        await bcrypt.compare(password, '$2b$12$dummyhashuntuktimingatack000000')
        throw new ResponseError(401, "phone or password is wrong");
    };

    const isPasswordValid = await bcrypt.compare(request.password, user.password);

    if (!isPasswordValid) {
        throw new ResponseError(401, "phone or password is wrong");
    };

    const payload = {
        id: user.id,
        phone: user.phone
    };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await prismaClient.user.update({
        where: {
            id: user.id
        },
        data: {
            token: refreshToken 
        }
    });

    return {
        id: user.id,
        phone: user.phone,
        accessToken: accessToken,
        refreshToken: refreshToken
    };

}

const logout = async (token) => {

    await prismaClient.user.updateMany({
        where: {
            token: token
        },
        data: {
            token: null
        }
    });

}

export default {
    create,
    login,
    logout
};