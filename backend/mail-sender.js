const dotenv = require("dotenv");
dotenv.config();
const nodemailer = require("nodemailer");

let mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.SENDER_PASSWORD,
  },
});

function sendEmail(to, subject, text) {
  let mailDetails = {
    from: process.env.SENDER_EMAIL,
    to: to,
    subject: subject,
    text: text,
  };

  mailTransporter.sendMail(mailDetails, function (err, data) {
    if (err) {
      console.log(`Error Occurs ${err}`);
    } else {
      console.log(`Email sent successfully ${JSON.stringify(data)}`);
    }
  });
}

module.exports = { sendEmail };
