import express from 'express';
import corsMiddleware from './cors.js';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import fileUpload from './file-upload.js';
import publicRouter from '../route/public-api.js';
import protectedRouter from '../route/protected-api.js';
import errorMiddleware from '../middleware/error-middleware.js';
import rateLimiter from './rate-limit.js';

const web = express();
web.use(corsMiddleware);
web.use(helmet());
web.use(rateLimiter);
web.use(express.json());
web.use(cookieParser());
web.use(fileUpload);
web.use("/api", publicRouter);
web.use("/api", protectedRouter);
web.use(errorMiddleware);

export {
    web
};