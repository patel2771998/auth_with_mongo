"use strict";
const nodemailer = require("nodemailer");
const dotenv = require('dotenv');
dotenv.config({ path: `.env.${process.env.NODE_ENV}` })



const forgotHtml = async (otp) => {

    const html = `<!DOCTYPE html>
    <html lang="en" style="background-color: #f5f5f5">
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
        <title>Forgot Password</title>
    </head>
    <body>
        <div>
            <p>You Recently Requested for Tixzar Movie Forgot Password</p>
            <p>Your OTP is <b>${otp}</b></p>
            <p><b>Please do not share OTP with anyone.</b></p>
        </div>
    </body>
    </html>`
    return html;
  
}

const vrifyAccountHtml = async (otp) => {

    const html = `<!DOCTYPE html>
    <html lang="en" style="background-color: #f5f5f5">
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
        <title>Forgot Password</title>
    </head>
    <body>
        <div>
            <p>You Recently Requested for Tixzar Movie Verify Account</p>
            <p>Your OTP is <b>${otp}</b></p>
            <p><b>Please do not share OTP with anyone.</b></p>
        </div>
    </body>
    </html>`
    return html;
  
}

const sendmail = async (userData) => {
    let transporter = nodemailer.createTransport({
        host: "smtp.hostinger.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTPUSER,
            pass: process.env.SMTPPASSWORD,
        },
    });

    //send mail with defined transport object
    let info = await transporter.sendMail({
        from: process.env.SMTPUSER, // sender address
        to: userData.to, // list of receivers
        cc: userData.cc,
        subject: userData.subject, // Subject line
        html: userData.html,
    });
    return info
}

module.exports = {
    sendmail,
    forgotHtml,
    vrifyAccountHtml
};
