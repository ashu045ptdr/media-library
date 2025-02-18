const Minio = require("minio");
require("dotenv").config();

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: parseInt(process.env.MINIO_PORT),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

async function uploadToMinIO(mediaId, fileBuffer) {
  return new Promise((resolve, reject) => {
    minioClient.putObject(process.env.MEDIA_BUCKET, mediaId, fileBuffer, (err, etag) => {
      if (err) reject(err);
      else resolve(etag);
    });
  });
}

async function getFromMinIO(mediaId) {
  return minioClient.getObject(process.env.MEDIA_BUCKET, mediaId);
}

module.exports = { uploadToMinIO, getFromMinIO };

