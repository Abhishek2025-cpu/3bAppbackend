const { Storage } = require('@google-cloud/storage');
const path = require('path');
const { PassThrough } = require('stream');
const { v4: uuidv4 } = require('uuid');

const storage = new Storage({
  keyFilename: path.join(__dirname, '../upload/product-uploader-key.json'),
});
const bucketName = '3-d_models'; // Your actual bucket name
const bucket = storage.bucket(bucketName);

// Upload image or model file buffer to GCS
const uploadToGCS = (fileBuffer, fileName, folder = 'products') => {
  return new Promise((resolve, reject) => {
    const uniqueName = `${folder}/${uuidv4()}-${fileName}`;
    const file = bucket.file(uniqueName);
    const passthroughStream = new PassThrough();

    passthroughStream.end(fileBuffer);

    passthroughStream
      .pipe(file.createWriteStream({ resumable: false, contentType: 'auto' }))
      .on('error', reject)
      .on('finish', () => {
        // Make public or use signed URL if needed
        const publicUrl = `https://storage.googleapis.com/${bucketName}/${uniqueName}`;
        resolve({
          url: publicUrl,
          name: uniqueName
        });
      });
  });
};

module.exports = { uploadToGCS };
