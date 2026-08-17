import cors from 'cors';

const getOriginWhitelist = () => {
    const origins = process.env.ORIGIN
        ? process.env.ORIGIN.split(',').map(item => item.trim()).filter(Boolean)
        : [];
    return origins;
};

const corsConfig = {
    origin: (origin, callback) => {
        if (!origin) {
            return callback(null, true);
        }

        const whitelist = getOriginWhitelist();

        const isAllowed =
            whitelist.includes('*') ||
            whitelist.includes(origin) ||
            /^http:\/\/localhost(:\d+)?$/.test(origin) ||
            /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin) ||
            /\.ngrok-free\.app$/.test(origin) ||
            /\.ngrok\.io$/.test(origin) ||
            /\.ngrok\.app$/.test(origin);

        if (isAllowed) {
            callback(null, true);
        } else {
            callback(new Error(`Origin ${origin} is not allowed by CORS`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'ngrok-skip-browser-warning'
    ],
    exposedHeaders: ['set-cookie']
};

const corsMiddleware = cors(corsConfig);

export default corsMiddleware;