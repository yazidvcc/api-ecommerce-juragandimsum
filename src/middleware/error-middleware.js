import { depth, logger } from "../application/logging.js";
import ResponseError from "../error/response-error.js";

const errorMiddleware = async (error, req, res, next) => {
    
    if (!error) {
        next();
        return;
    }

    if (error instanceof ResponseError) {
        return res.status(error.status).json({
            errors: error.message
        }).end();
    } else {
        depth(`Unhandled Error : ${error.message}`)
        res.status(500).json({
            errors: "Internal server error"
        }).end();
    }
};

export default errorMiddleware;