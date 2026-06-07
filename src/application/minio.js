import * as Minio from 'minio';

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || '127.0.0.1',
    port: parseInt(process.env.MINIO_PORT || '9000'),
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

async function initBucket() {
    const bucket = process.env.MINIO_BUCKET_PRODUCT;
    const exist = await minioClient.bucketExists(bucket);

    if (!exist) {
        await minioClient.makeBucket(bucket, 'ap-southeast-1');
        console.log(`bucket ${bucket} created`);
    }
};

(async () => {
    try {
        await initBucket();
    } catch (e) {
        console.warn("MinIO connection failed. Make sure MinIO is running:", e.message);
    }
})();

export default minioClient;