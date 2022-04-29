const nodemailer = require("nodemailer");

const sendEmail = async (options) =>  {
    console.log(`${process.env.NAME_FROM} <${process.env.EMAIL_FROM}>`)
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port:  process.env.SMTP_PORT,
    auth: {
      user: process.env.SMPT_USERNAME, 
      pass: process.env.SMPT_PASSWORD, 
    },
  });

  // send mail with defined transport object
  const message = {
    from: `${process.env.NAME_FROM} <${process.env.EMAIL_FROM}>`,
    to: options.email, 
    subject: options.subject, 
    text: options.message, 
  };


  let info = await transporter.sendMail(message)



}

module.exports = sendEmail ;