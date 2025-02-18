// const Minio = require("minio");
// require("dotenv").config();

// const minioClient = new Minio.Client({
//   endPoint: process.env.MINIO_ENDPOINT,
//   port: parseInt(process.env.MINIO_PORT),
//   useSSL: false,
//   accessKey: process.env.MINIO_ACCESS_KEY,
//   secretKey: process.env.MINIO_SECRET_KEY,
// });

// async function uploadToMinIO(mediaId, fileBuffer) {
//   return new Promise((resolve, reject) => {
//     minioClient.putObject(process.env.MEDIA_BUCKET, mediaId, fileBuffer, (err, etag) => {
//       if (err) reject(err);
//       else resolve(etag);
//     });
//   });
// }

// async function getFromMinIO(mediaId) {
//   return minioClient.getObject(process.env.MEDIA_BUCKET, mediaId);
// }

// module.exports = { uploadToMinIO, getFromMinIO };


const Minio = require("minio");

// ✅ MinIO Client Setup
const minioClient = new Minio.Client({
  endPoint: "localhost",
  port: 9000,
  useSSL: false,
  accessKey: "minioadmin",
  secretKey: "minioadmin",
});

// ✅ Upload to MinIO with Content-Type
async function uploadToMinIO(mediaId, fileBuffer, contentType) {
  return new Promise((resolve, reject) => {
    minioClient.putObject(
      "media-bucket",
      mediaId,
      fileBuffer,
      { "Content-Type": contentType }, // ✅ Set MIME type
      (err, etag) => {
        if (err) return reject(err);
        resolve(etag);
      }
    );
  });
}

// ✅ Get File from MinIO
function getFromMinIO(mediaId, callback) {
  minioClient.getObject("media-bucket", mediaId, callback);
}

module.exports = { uploadToMinIO, getFromMinIO };
