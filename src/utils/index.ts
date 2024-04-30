import {Request, Response} from "express"
import jwt from "jsonwebtoken"
import {IVerifedToken} from "../types/user"
import {
  clientModel,
  farmerModel,
  projectModel,
  transactionModel,
} from "../models"
import {otpModel} from "../models/Otp.model"

export const currentUser = async (req: Request, res: Response) => {
  try {
    const {token} = req.cookies
    if (!token) {
      res
        .status(401)
        .cookie("token", undefined, {httpOnly: true, maxAge: 0})
        .send({error: true, message: "Not Login"})
      return undefined
    }
    const verify = jwt.verify(token, process.env.JWT_SECRET!)

    if (!verify) {
      res
        .status(401)
        .cookie("token", undefined, {httpOnly: true, maxAge: 0})
        .send({error: true, message: "invalid or expired token"})
      return undefined
    }

    return verify as IVerifedToken
  } catch (error: any) {
    return undefined
  }
}

export const getUserRole = async (req: Request, res: Response) => {
  const user = await currentUser(req, res)
  if (!user) {
    return undefined
  }
  return user.role
}

export const getUserId = async (req: Request, res: Response) => {
  const user = await currentUser(req, res)
  if (!user) {
    return undefined
  }
  return user.userId
}

export const generateClientID = async () => {
  try {
    const year = new Date().getFullYear()
    let randomDigits = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0")
    let id = `PGC-${year}-${randomDigits}`
    const idCheck = await clientModel.find({client_id: id})
    while (idCheck.length > 0) {
      randomDigits = Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, "0")

      id = `PGC-${year}-${randomDigits}`
    }
    return id
  } catch (error) {}
}

export const generateFarmerID = async () => {
  try {
    const year = new Date().getFullYear()
    let randomDigits = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0")
    let id = `PGF-${year}-${randomDigits}`
    const idCheck = await farmerModel.find({farmer_id: id})
    while (idCheck.length > 0) {
      randomDigits = Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, "0")

      id = `PGF-${year}-${randomDigits}`
    }
    return id
  } catch (error) {}
}

export const getCurrentProject = async () => {
  const project = await projectModel.findOne({status: "STARTED"})
  if (!project) {
    return undefined
  }
  return project
}

export const generateOTP = async () => {
  try {
    return Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")
  } catch (error) {}
}

export const generateRefID = async () => {
  try {
    const project = await getCurrentProject()
    const year = new Date().getFullYear()
    let randomDigits = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0")
    let id = `TR-${project?.code}-${randomDigits}`
    const idCheck = await transactionModel.find({ref_id: id})
    while (idCheck.length > 0) {
      randomDigits = Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, "0")

      id = `TR-${project?.code}-${randomDigits}`
    }
    return id
  } catch (error) {}
}
