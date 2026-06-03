import * as Minio from 'minio';

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT,
    port: parseInt(process.env.MINIO_PORT),
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
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
    await initBucket();
})();

export default minioClient;