import { createClient } from "redis";

const redis = createClient({
    url: process.env.REDIS_URL
});

redis.connect().then(() => {
    console.log("Redis Client Connected");
}).catch((err) => {
    console.log("Redis Client Error", err);
});

export default redis;