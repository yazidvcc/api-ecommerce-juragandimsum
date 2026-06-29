import validate from "../validation/validation.js";
import prismaClient from "../application/database.js";
import ResponseError from "../error/response-error.js";
import bcrypt from "bcrypt";
import { createUserValidation, loginUserValidation } from "../validation/user-validation.js";
import { signAccessToken, signRefreshToken } from "../application/token.js";
import redis from "../application/redis.js";

const create = async (request) => {

    request = validate(createUserValidation, request);

    const phone = request.phone.startsWith("0") ? `62${request.phone.slice(1)}` : request.phone;

    const countInDatabase = await prismaClient.user.count({
        where: {
            phone: phone
        }
    });

    if (countInDatabase > 0) {
        throw new ResponseError(400, "phone is already exist");
    };

    request.phone = phone;
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

    const loginAttemptKey = `login_attempts:${request.phone}`;
    const attempts = await redis.get(loginAttemptKey);

    if (attempts && parseInt(attempts) >= 5) {
        throw new ResponseError(429, "Terlalu banyak percobaan login. Coba lagi dalam 15 menit.");
    }

    const user = await prismaClient.user.findUnique({
        where: {
            phone: request.phone
        }
    });

    if (!user) {
        await bcrypt.compare(request.password, '$2b$12$dummyhashuntuktimingatack000000');
        await redis.incr(loginAttemptKey);
        await redis.expire(loginAttemptKey, 900);
        throw new ResponseError(401, "phone or password is wrong");
    };

    const isPasswordValid = await bcrypt.compare(request.password, user.password);

    if (!isPasswordValid) {
        await redis.incr(loginAttemptKey);
        await redis.expire(loginAttemptKey, 900);
        throw new ResponseError(401, "phone or password is wrong");
    };

    await redis.del(loginAttemptKey);

    const payload = {
        id: user.id,
        phone: user.phone,
        role: user.role
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

const get = async (userId) => {
    
    const user = await prismaClient.user.findUnique({
        where: { id: userId},
        select: {
            id: true,
            name: true,
            role: true,
            phone: true
        }
    })

    if (!user) {
        throw new ResponseError(404, "User is not found");
    }

    return user;

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
    get,
    logout
};