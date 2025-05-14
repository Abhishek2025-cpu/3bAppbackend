const axios = require('axios');

exports.sendPushNotification = async (token, { title, body }) => {
  const serverKey = 'AAAAaRhh...YOUR_SERVER_KEY...K_tZC84'; // You must replace this with your actual FCM Server Key

  const message = {
    to: token,
    notification: {
      title,
      body
    }
  };

  try {
    const response = await axios.post('https://fcm.googleapis.com/fcm/send', message, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${serverKey}`
      }
    });
    return response.data;
  } catch (err) {
    console.error("FCM Error:", err.response?.data || err.message);
  }
};
