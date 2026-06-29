import * as Minio from 'minio';

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || '127.0.0.1',
    port: parseInt(process.env.MINIO_PORT || '9000'),
    useSSL: process.env.NODE_ENV === "production",
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

async function initBucket() {
    const bucketProduct = process.env.MINIO_BUCKET_PRODUCT;
    const bucketBanner = process.env.MINIO_BUCKET_BANNER;
    const isBucketProductExist = await minioClient.bucketExists(bucketProduct);
    const isBucketBannerExist = await minioClient.bucketExists(bucketBanner);

    if (!isBucketProductExist) {
        await minioClient.makeBucket(bucketProduct, 'ap-southeast-1');
        console.log(`bucket ${bucketProduct} created`);
    }
    if (!isBucketBannerExist) {
        await minioClient.makeBucket(bucketBanner, 'ap-southeast-1');
        console.log(`bucket ${bucketBanner} created`);
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