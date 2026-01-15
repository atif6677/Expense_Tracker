// src/services/s3Services.js

const AWS = require('aws-sdk');

function uploadToS3(data, filename) {
  return new Promise((resolve, reject) => {
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: filename,
      Body: data,
      ACL: 'public-read',
    };

    s3.upload(params, (err, result) => {
      if (err) {
        console.error(' S3 Upload Error:', err);
        reject(err);
      } else {
        console.log(' S3 Upload Success:', result.Location);
        resolve(result.Location);
      }
    });
  });
}

exports.uploadToS3 = uploadToS3;
