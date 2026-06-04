import validate from "../validation/validation.js";
import prismaClient from "../application/database.js";
import ResponseError from "../error/response-error.js";
import bcrypt from "bcrypt";
import { createUserValidation } from "../validation/user-validation.js";

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

export default {
    create
};