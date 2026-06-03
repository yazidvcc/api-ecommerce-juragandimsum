import cors from 'cors';

const corsConfig = {
    origin: process.env.ORIGIN,
    credentials: true
};

const corsMiddleware = cors(corsConfig);

export default corsMiddleware;