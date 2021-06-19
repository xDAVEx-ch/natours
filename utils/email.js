const nodemailer = require('nodemailer');

const sendEmail = async options => {
    //Create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    //Defining email options
    const mailOptions = {
        from: 'Dave Ch <email@direction.io>',
        to: options.email,
        subject: options.subject,
        text: options.message
    }

    //Sending email
    await transporter.sendMail(mailOptions)
}

module.exports = sendEmail;