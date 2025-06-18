const { Storage } = require('@google-cloud/storage');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const { v4: uuidv4 } = require('uuid');

const client = new SecretManagerServiceClient();
const bucketName = 'product-images-2025';

// Load service account key from Secret Manager
async function getServiceAccountKey() {
  const [version] = await client.accessSecretVersion({
    name: 'projects/1067354145699/secrets/gcs-service-account-key/versions/latest',
  });
  const payload = version.payload.data.toString('utf8');
  return JSON.parse(payload);
}

// Upload buffer to GCS (image, pdf, etc.)
async function uploadBufferToGCS(buffer, fileName, folder = 'products', contentType = 'image/jpeg') {
  const serviceAccountKey = await getServiceAccountKey();

  const storage = new Storage({ credentials: serviceAccountKey });
  const bucket = storage.bucket(bucketName);

  const uniqueFileName = `${folder}/${uuidv4()}-${fileName}`;
  const blob = bucket.file(uniqueFileName);

  return new Promise((resolve, reject) => {
    const stream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType,
        cacheControl: 'public, max-age=31536000',
      },
    });

    stream.on('error', reject);

    stream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      resolve({ url: publicUrl, public_id: blob.name });
    });

    stream.end(buffer);
  });
}

module.exports = { uploadBufferToGCS };
