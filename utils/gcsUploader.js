const { Storage } = require('@google-cloud/storage');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Setup GCS with service account key
const storage = new Storage({
  keyFilename: path.join(__dirname, '..', 'gcs-key.json'),
});

const bucket = storage.bucket('product-images-2025'); // 🔁 Replace with your bucket name

const uploadBufferToGCS = (buffer, fileName, folder = 'products') => {
  return new Promise((resolve, reject) => {
    const uniqueFileName = `${folder}/${uuidv4()}-${fileName}`;
    const blob = bucket.file(uniqueFileName);
    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType: 'image/jpeg', // You can make this dynamic if needed
        cacheControl: 'public, max-age=31536000',
      },
    });

    blobStream.on('error', reject);

    blobStream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      resolve({ url: publicUrl, public_id: blob.name });
    });

    blobStream.end(buffer);
  });
};

module.exports = { uploadBufferToGCS };
