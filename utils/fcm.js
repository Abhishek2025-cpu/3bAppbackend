// utils/fcm.js or config/firebase.js
const admin = require('firebase-admin');
const serviceAccount = require('../config/serviceAccountKey.json'); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;
