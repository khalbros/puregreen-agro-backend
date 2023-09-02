import {Request, Response} from "express"
import jwt from "jsonwebtoken"
import bcryptjs from "bcryptjs"
import {userModel} from "../models"
import {IUser} from "../types/user"
import {sendMail} from "../utils/send-mail"
import {otpModel} from "../models/Otp.model"
import {getUserId} from "../utils"

export const login = async (req: Request, res: Response) => {
  const {email, password}: IUser = req.body
  if (!email || !password) {
    return res.status(400).send({
      error: true,
      message: "User inputs error (some fields are empty / invalid)",
    })
  }

  try {
    const user = await userModel.findOne({email: email.toLowerCase()})
    if (!user) {
      return res.status(400).send({error: true, message: "Invalid credential"})
    }

    const passwordCheck = await bcryptjs.compare(password, user.password!)

    if (!passwordCheck) {
      return res.status(400).send({error: true, message: "Invalid credential"})
    }

    const token = jwt.sign(
      {userId: user._id, email: user.email, phone: user.phone, role: user.role},
      process.env.JWT_SECRET!,
      {expiresIn: "1d"}
    )

    return res
      .status(200)
      .cookie("token", token, {httpOnly: true, maxAge: 86400000})
      .send({error: false, message: "Login successfully", token})
  } catch (error: any) {
    return res.send({error: true, message: error?.message})
  }
}

export const forgotPassword = async (req: Request, res: Response) => {
  const {email}: IUser = req.body
  if (!email) {
    return res.status(400).send({
      error: true,
      message: "User inputs error (some fields are empty / invalid)",
    })
  }

  try {
    const user = await userModel.findOne({email: email.toLowerCase()})
    if (!user) {
      return res.status(400).send({error: true, message: "Email not found"})
    }
    const randomNumber = Math.floor(Math.random() * 10000)

    const otp = await bcryptjs.hash(String(randomNumber), 12)

    sendMail(email, "Password reset OTP", `Your verification code is: ${otp}`)
      .then(async (result) => {
        const newOtp = await otpModel.create({
          otp,
          user_email: email,
          expire_in: new Date(new Date().getTime() + 5 * 60 * 1000),
        })
        await newOtp.save()
        return res
          .status(200)
          .cookie("user", email, {httpOnly: true, maxAge: 86400000})
          .send({error: false, message: "OTP has been sent"})
      })
      .catch((error) => res.send({error: true, message: error?.message}))
  } catch (error: any) {
    return res.send({error: true, message: error?.message})
  }
}

export const changePassword = async (req: Request, res: Response) => {
  const {old_password, new_password} = req.body
  if (!old_password || !new_password) {
    return res.status(400).send({
      error: true,
      message: "User inputs error (some fields are empty / invalid)",
    })
  }

  try {
    const userID = await getUserId(req, res)
    const user = await userModel.findOne({_id: userID})
    if (!user) {
      return res.status(400).send({error: true, message: "Please login"})
    }

    const passwordMatch = await bcryptjs.compare(
      old_password as string,
      user.password!
    )
    if (!passwordMatch)
      return res
        .status(400)
        .send({error: true, message: "old password not match"})

    const hashPassword = await bcryptjs.hash(new_password, 12)
    user.password = hashPassword
    await user.save()
    return res.status(200).send({error: false, message: "Password Changed"})
  } catch (error: any) {
    return res.send({error: true, message: error?.message})
  }
}

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const email = req.cookies.user

    if (!email) {
      return res.status(400).send({
        error: true,
        message: "Error Please pass an ID to query",
      })
    }

    const password = bcryptjs.hash(req.body.password, 12)

    const user = await userModel.findOneAndUpdate(email, password, {
      new: true,
      runValidators: true,
    })
    if (!user) {
      return res.status(404).send({
        error: true,
        message: "User not found",
      })
    }

    return res.status(200).send({error: false, message: "Password reset"})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const verifyOtp = async (req: Request, res: Response) => {
  const {otp} = req.body
  const email = req.cookies.user
  if (!otp) {
    return res.status(400).send({
      error: true,
      message: "User inputs error (some fields are empty / invalid)",
    })
  }

  try {
    const user = await otpModel.findOne({email: email.toLowerCase()})
    if (!user) {
      return res
        .status(400)
        .send({error: true, message: "Email not found / invalid"})
    }
    const otpMatch = bcryptjs.compare(user.otp as string, otp!)

    if (!otpMatch) {
      return res.status(400).send({error: true, message: "Wrong OTP"})
    }
    await otpModel.findByIdAndDelete(user._id)
    return res.status(200).send({error: false, message: "OTP verified"})
  } catch (error: any) {
    return res.send({error: true, message: error?.message})
  }
}

export const logout = async (req: Request, res: Response) => {
  try {
    return res
      .status(200)
      .cookie("token", undefined, {httpOnly: true, maxAge: 0})
      .send({error: false, message: "Logout successfully"})
  } catch (error: any) {
    return res.send({error: true, message: error?.message})
  }
}
