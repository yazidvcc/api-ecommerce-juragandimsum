import { createClient } from "redis";

const redis = createClient({
    url: process.env.REDIS_URL,
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > 20) {
                console.error("Redis Client: Maksimal percobaan koneksi ulang tercapai. Menghentikan percobaan.");
                return new Error("Maksimal percobaan koneksi ulang tercapai");
            }
            const delay = Math.min(retries * 200, 5000);
            console.log(`[Redis] Koneksi terputus. Mencoba menghubungkan kembali dalam ${delay}ms... (Percobaan ke-${retries})`);
            return delay; 
        }
    }
});

redis.on("connect", () => {
    console.log("Redis Client: Terhubung ke server");
});

redis.on("ready", () => {
    console.log("Redis Client: Siap digunakan (Ready)");
});

redis.on("error", (err) => {
    console.error("Redis Client Error:", err.message || err);
});

redis.on("end", () => {
    console.log("Redis Client: Koneksi ditutup");
});

// Lakukan koneksi awal
redis.connect().catch((err) => {
    console.error("Redis Client: Gagal melakukan koneksi awal", err);
});

export default redis;