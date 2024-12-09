const nodemailer = require('nodemailer');
const catchAsync = require('./catchAsync');

const sendEmail = catchAsync(async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    secure: false,
    logger: true,
    tls: {
      rejectUnauthorized: true,
    },
  });
  // 2) Define the email options
  const mailOptions = {
    from: `Md Abdullah <${process.env.EMAIL_FROM}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    //html:
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
});

module.exports = sendEmail;
