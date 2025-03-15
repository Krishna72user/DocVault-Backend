import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()
const transporter = nodemailer.createTransport({
  service:'Gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASS,
  },
});

async function main(otp,email) {
  // send mail with defined transport object
  try {
      const info = await transporter.sendMail({
        from: process.env.EMAIL, // sender address
        to: email, // list of receivers
        subject: "OTP Verification", // Subject line
        text:`The otp is ${otp}. Please dont share with anyone`, // plain text body
      });
      return  {'success':true}
  } catch (error) {
    return {'success':false,error}
  }
}
export {main}