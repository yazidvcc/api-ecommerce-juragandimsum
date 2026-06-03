import winston from 'winston';
import util from "util";

export const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console({})
    ]
});

export function depth(params) {
    console.log(util.inspect(params, { depth: 10 }));
};