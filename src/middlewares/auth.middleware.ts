import {NextFunction, Request, Response} from "express"
import jwt from "jsonwebtoken"
import {IVerifedToken} from "../types/user"

export const isLoggedIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {token} = req.cookies
    if (!token) {
      return res
        .status(401)
        .cookie("token", undefined, {httpOnly: true, maxAge: 0})
        .send({error: true, message: "Not Login"})
    }
    const verify = jwt.verify(token, process.env.JWT_SECRET!)

    if (!verify) {
      return res
        .status(401)
        .cookie("token", undefined, {httpOnly: true, maxAge: 0})
        .send({error: true, message: "invalid or expired token"})
    }
    next()
  } catch (error: any) {
    return res.status(500).send({error: true, message: error.message})
  }
}

export const isSuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {token} = req.cookies
    if (!token) {
      return res
        .status(401)
        .cookie("token", undefined, {httpOnly: true, maxAge: 0})
        .send({error: true, message: "Not Login"})
    }
    const verify = jwt.verify(token, process.env.JWT_SECRET!)

    if (!verify) {
      return res
        .status(401)
        .cookie("token", undefined, {httpOnly: true, maxAge: 0})
        .send({error: true, message: "invalid or expired token"})
    }
    if ((verify as IVerifedToken).role !== "SUPER ADMIN") {
      return res.status(403).send({error: true, message: "Access Denied!"})
    }
    next()
  } catch (error: any) {
    return res.status(500).send({error: true, message: error.message})
  }
}

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {token} = req.cookies
    if (!token) {
      return res
        .status(401)
        .cookie("token", undefined, {httpOnly: true, maxAge: 0})
        .send({error: true, message: "Not Login"})
    }
    const verify = jwt.verify(token, process.env.JWT_SECRET!)

    if (!verify) {
      return res
        .status(401)
        .cookie("token", undefined, {httpOnly: true, maxAge: 0})
        .send({error: true, message: "invalid or expired token"})
    }
    if ((verify as IVerifedToken).role !== "ADMIN") {
      return res.status(403).send({error: true, message: "Access Denied!"})
    }
    next()
  } catch (error: any) {
    return res.status(500).send({error: true, message: error.message})
  }
}

export const isWarehouseManager = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {token} = req.cookies
    if (!token) {
      return res
        .status(401)
        .cookie("token", undefined, {httpOnly: true, maxAge: 0})
        .send({error: true, message: "Not Login"})
    }
    const verify = jwt.verify(token, process.env.JWT_SECRET!)

    if (!verify) {
      return res
        .status(401)
        .cookie("token", undefined, {httpOnly: true, maxAge: 0})
        .send({error: true, message: "invalid or expired token"})
    }
    if ((verify as IVerifedToken).role !== "WAREHOUSE MANAGER") {
      return res.status(403).send({error: true, message: "Access Denied!"})
    }
    next()
  } catch (error: any) {
    return res.status(500).send({error: true, message: error.message})
  }
}

export const isSupervisor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {token} = req.cookies
    if (!token) {
      return res
        .status(401)
        .cookie("token", undefined, {httpOnly: true, maxAge: 0})
        .send({error: true, message: "Not Login"})
    }
    const verify = jwt.verify(token, process.env.JWT_SECRET!)

    if (!verify) {
      return res
        .status(401)
        .cookie("token", undefined, {httpOnly: true, maxAge: 0})
        .send({error: true, message: "invalid or expired token"})
    }
    if ((verify as IVerifedToken).role !== "SUPERVISOR") {
      return res.status(403).send({error: true, message: "Access Denied!"})
    }
    next()
  } catch (error: any) {
    return res.status(500).send({error: true, message: error.message})
  }
}

export const isFieldOfficer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {token} = req.cookies
    if (!token) {
      return res
        .status(401)
        .cookie("token", undefined, {httpOnly: true, maxAge: 0})
        .send({error: true, message: "Not Login"})
    }
    const verify = jwt.verify(token, process.env.JWT_SECRET!)

    if (!verify) {
      return res
        .status(401)
        .cookie("token", undefined, {httpOnly: true, maxAge: 0})
        .send({error: true, message: "invalid or expired token"})
    }
    if ((verify as IVerifedToken).role !== "FIELD OFFICER") {
      return res.status(403).send({error: true, message: "Access Denied!"})
    }
    next()
  } catch (error: any) {
    return res.status(500).send({error: true, message: error.message})
  }
}

export const isSuperAdminOrAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {token} = req.cookies
    if (!token) {
      return res
        .status(401)
        .cookie("token", undefined, {httpOnly: true, maxAge: 0})
        .send({error: true, message: "Not Login"})
    }
    const verify = jwt.verify(token, process.env.JWT_SECRET!)

    if (!verify) {
      return res
        .status(401)
        .cookie("token", undefined, {httpOnly: true, maxAge: 0})
        .send({error: true, message: "invalid or expired token"})
    }
    if (
      (verify as IVerifedToken).role !== "SUPER ADMIN" &&
      (verify as IVerifedToken).role !== "ADMIN"
    ) {
      return res.status(403).send({
        error: true,
        message: "Access Denied! (you are not a field officer)",
      })
    }
    next()
  } catch (error: any) {
    return res.status(500).send({error: true, message: error.message})
  }
}

export const isSupervisorOrFieldOfficer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {token} = req.cookies
    if (!token) {
      return res
        .status(401)
        .cookie("token", undefined, {httpOnly: true, maxAge: 0})
        .send({error: true, message: "Not Login"})
    }
    const verify = jwt.verify(token, process.env.JWT_SECRET!)

    if (!verify) {
      return res
        .status(401)
        .cookie("token", undefined, {httpOnly: true, maxAge: 0})
        .send({error: true, message: "invalid or expired token"})
    }
    if (
      (verify as IVerifedToken).role !== "SUPERVISOR" &&
      (verify as IVerifedToken).role !== "FIELD OFFICER"
    ) {
      return res
        .status(403)
        .send({
          error: true,
          message:
            "Access Denied! (only supervisors and field officer allowed)",
        })
    }
    next()
  } catch (error: any) {
    return res.status(500).send({error: true, message: error.message})
  }
}

export const isSupervisorOrWarehouseManager = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {token} = req.cookies
    if (!token) {
      return res
        .status(401)
        .cookie("token", undefined, {httpOnly: true, maxAge: 0})
        .send({error: true, message: "Not Login"})
    }
    const verify = jwt.verify(token, process.env.JWT_SECRET!)

    if (!verify) {
      return res
        .status(401)
        .cookie("token", undefined, {httpOnly: true, maxAge: 0})
        .send({error: true, message: "invalid or expired token"})
    }
    if (
      (verify as IVerifedToken).role !== "SUPERVISOR" &&
      (verify as IVerifedToken).role !== "WAREHOUSE MANAGER"
    ) {
      return res.status(403).send({error: true, message: "Access Denied!"})
    }
    next()
  } catch (error: any) {
    return res.status(500).send({error: true, message: error.message})
  }
}
