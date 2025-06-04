const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'abhisheks@pearlorganisation.com',
    pass: 'exrwrloeisbbypdz' // e.g. abcd efgh ijkl mnop
  }
});
