import nodemailer from "nodemailer"

interface mailParams {
  to: string
  subject: string
  message: string
}

export async function sendEmail(params: mailParams) {
  try {
    const {to, subject, message} = params
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL,
        pass: process.env.MAIL_PASSWORD,
      },
    })

    const options = {
      from: process.env.MAIL as string,
      to,
      subject,
      html: message,
    }
    transporter.verify((err, success) => {
      if (err) {
        return {success: false, message: err}
      }
      if (success) {
        return {success, message: "message sent"}
      }
    })
    return await transporter.sendMail(options)
  } catch (error: any) {
    return {success: false, message: error.message}
  }
}
