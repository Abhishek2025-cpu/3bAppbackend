const { Storage } = require('@google-cloud/storage');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const { v4: uuidv4 } = require('uuid');

const client = new SecretManagerServiceClient();
const bucketName = 'product-images-2025';

async function getServiceAccountKey() {
  const [version] = await client.accessSecretVersion({
    name: 'projects/1067354145699/secrets/gcs-service-account-key/versions/latest',
  });
  const payload = version.payload.data.toString('utf8');
  return JSON.parse(payload);
}

async function uploadBufferToGCS(buffer, fileName, folder = 'products', contentType = 'image/jpeg') {
  const serviceAccountKey = await getServiceAccountKey();

  const storage = new Storage({ credentials: serviceAccountKey });
  const bucket = storage.bucket(bucketName);

  const uniqueFileName = `${folder}/${uuidv4()}-${fileName}`;
  const blob = bucket.file(uniqueFileName);

  await blob.save(buffer, {
    metadata: {
      contentType,
      cacheControl: 'public, max-age=31536000',
    },
    resumable: false,
  });

  // Generate a signed URL (valid for 1 year)
  const [url] = await blob.getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
  });

  return {
    url,
    public_id: blob.name,
  };
}

module.exports = { uploadBufferToGCS };
