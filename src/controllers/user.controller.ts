import {Request, Response} from "express"
import {farmerModel, userModel, warehouseModel} from "../models"
import {IUser} from "../types/user"
import bcryptjs from "bcryptjs"
import {currentUser, getUserId, getUserRole} from "../utils"
import mongoose from "mongoose"
import imageUpload from "../utils/file-upload"

export const createUser = async (req: Request, res: Response) => {
  try {
    const user_list = await userModel.find()

    if (user_list.length > 0) {
      const user_role = await getUserRole(req, res)
      if (!user_role) {
        return
      }
      if (user_role !== "SUPER ADMIN") {
        return res.status(403).send({error: true, message: "Access Denied!"})
      }
    }

    const {
      name,
      email,
      phone,
      password,
      role,
      gender,
      warehouse,
      supervisor,
      profile_img,
    }: IUser = req.body

    if (!name || !email || !phone || !password || !gender || !role) {
      return res.status(400).send({
        error: true,
        message: "User inputs error (some fields are empty / invalid)",
      })
    }
    const emailCheck = await userModel.findOne({email: email.toLowerCase()})
    if (emailCheck)
      return res.status(400).send({error: true, message: "Email already exist"})

    const phoneCheck = await userModel.findOne({phone})
    if (phoneCheck)
      return res
        .status(400)
        .send({error: true, message: "Phone number already exist"})

    const passwordHash = await bcryptjs.hash(password, 12)

    const newUser = await userModel.create({
      ...req.body,
      name: name.toLowerCase(),
      email: email.toLowerCase(),
      password: passwordHash,
      profile_img: profile_img && (await imageUpload(profile_img)),
    })

    if (role === "WAREHOUSE MANAGER") {
      const selectedwarehouse = await warehouseModel.findById({_id: warehouse})
      if (!selectedwarehouse) {
        return res.send({error: true, message: "Invalid warehouse ID"})
      }
      selectedwarehouse.warehouse_manager = newUser._id
      await selectedwarehouse.save()
    }
    if (role === "SUPERVISOR") {
      const selectedwarehouse = await warehouseModel.findById({_id: warehouse})
      if (!selectedwarehouse) {
        return res.send({error: true, message: "Invalid warehouse ID"})
      }
      selectedwarehouse.supervisors.push(newUser._id)
      await selectedwarehouse.save()
    }
    if (role === "FIELD OFFICER") {
      const selectedSupervisor = await userModel.findById({_id: supervisor})
      if (!selectedSupervisor) {
        return res.send({error: true, message: "Invalid Supervisor ID"})
      }
      selectedSupervisor.field_officers.push(newUser._id)
      await selectedSupervisor.save()
    }

    newUser
      .save()
      .then(
        () => {
          return res.status(201).send({
            error: false,
            message: "User created successfully",
            data: newUser,
          })
        },
        (err) => {
          return res.send({error: true, message: err?.message})
        }
      )
      .catch((err) => {
        return res.send({error: true, message: err?.message})
      })
  } catch (error: any) {
    return res.send({error: true, message: error?.message})
  }
}

export const getUser = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please set a search key (No ID found)",
      })
    }

    const user = await userModel
      .findById(id)
      .populate("warehouse")
      .populate("supervisor")
      .populate("field_officers")
    if (!user) {
      return res.status(404).send({
        error: true,
        message: "User not found",
      })
    }

    return res.status(200).send({error: false, message: "Success", data: user})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const getAllUsers = async (req: Request, res: Response) => {
  const queries = req.query
  try {
    const currentUser = await getUserId(req, res)
    if (queries) {
      const users = await userModel
        .find({_id: {$ne: currentUser}, ...queries})
        .populate("warehouse")
        .populate("supervisor")
        .populate("field_officers")
      return res
        .status(200)
        .send({error: false, message: "Success", data: users})
    }
    const users = await userModel
      .find({_id: {$ne: currentUser}})
      .populate("warehouse")
      .populate("supervisor")
      .populate("field_officers")
    return res.status(200).send({error: false, message: "Success", data: users})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const updateUser = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    const currrentUserId = await getUserId(req, res)
    const user_role = await getUserRole(req, res)
    const {role, warehouse, supervisor, profile_img}: IUser = req.body

    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please pass an ID to query",
      })
    }

    if (user_role !== "SUPER ADMIN" && currrentUserId !== id) {
      return res.status(403).send({
        error: true,
        message: "Only Super admin can edit other users data",
      })
    }

    const user = await userModel.findByIdAndUpdate(
      id,
      {
        ...req.body,
        profile_img: profile_img && (await imageUpload(profile_img)),
      },
      {
        new: true,
        runValidators: true,
      }
    )
    if (!user) {
      return res.status(404).send({
        error: true,
        message: "User not found",
      })
    }
    if (role === "WAREHOUSE MANAGER") {
      const selectedwarehouse = await warehouseModel.findById({_id: warehouse})
      if (!selectedwarehouse) {
        return res.send({error: true, message: "Invalid warehouse ID"})
      }
      selectedwarehouse.warehouse_manager = user._id
      await selectedwarehouse.save()
    }
    if (role === "SUPERVISOR") {
      const selectedwarehouse = await warehouseModel.findById({_id: warehouse})
      if (!selectedwarehouse) {
        return res.send({error: true, message: "Invalid warehouse ID"})
      }
      if (!selectedwarehouse.supervisors.includes(user._id)) {
        selectedwarehouse.supervisors.push(user._id)
        await selectedwarehouse.save()
      }
    }
    if (role === "FIELD OFFICER") {
      const selectedSupervisor = await userModel.findById({_id: supervisor})
      if (!selectedSupervisor) {
        return res.send({error: true, message: "Invalid Supervisor ID"})
      }
      selectedSupervisor.field_officers.push(user._id)
      await selectedSupervisor.save()
    }
    return res
      .status(200)
      .send({error: false, message: "User updated", data: user})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please pass an ID to query (No ID found)",
      })
    }

    const user = await userModel.findByIdAndDelete(id)
    if (!user) {
      return res.status(404).send({
        error: true,
        message: "User not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "User Deleted", data: user})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const getProfile = async (req: Request, res: Response) => {
  try {
    const currrentUserId = await getUserId(req, res)
    if (!currrentUserId) {
      return res.status(400).send({
        error: true,
        message: "Error Please login",
      })
    }

    const user = await userModel
      .findById(currrentUserId)
      .populate("warehouse")
      .populate("supervisor")
      .populate("field_officers")
    if (!user) {
      return res.status(404).send({
        error: true,
        message: "profile not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "profile fetched", data: user})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const getAllFEOs = async (req: Request, res: Response) => {
  const queries = req.query
  const user = await currentUser(req, res)
  try {
    if (queries) {
      if (user?.role === "SUPERVISOR") {
        const users = await userModel
          .find({role: "FIELD OFFICER", supervisor: user?.userId, ...queries})
          .populate("warehouse")
          .populate("supervisor")
          .populate("field_officers")
          .sort({createdAt: -1})
          .limit(Number(queries.limit))
        return res
          .status(200)
          .send({error: false, message: "Success", data: users})
      }
      const users = await userModel
        .find({role: "FIELD OFFICER", ...queries})
        .populate("warehouse")
        .populate("supervisor")
        .populate("field_officers")
        .sort({createdAt: -1})
        .limit(Number(queries.limit))
      return res
        .status(200)
        .send({error: false, message: "Success", data: users})
    }
    if (user?.role === "SUPERVISOR") {
      const users = await userModel
        .find({role: "FIELD OFFICER", supervisor: user?.userId})
        .populate("warehouse")
        .populate("supervisor")
        .populate("field_officers")
        .sort({createdAt: -1})

      return res
        .status(200)
        .send({error: false, message: "Success", data: users})
    }
    const users = await userModel
      .find({role: "FIELD OFFICER"})
      .populate("warehouse")
      .populate("supervisor")
      .populate("field_officers")
      .sort({createdAt: -1})

    return res.status(200).send({error: false, message: "Success", data: users})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const getFEOWithFarmersCount = async (req: Request, res: Response) => {
  const queries = req.query
  const user = await currentUser(req, res)
  try {
    if (user?.role === "SUPERVISOR") {
      const users = await userModel
        .aggregate([
          {$match: {supervisor: new mongoose.Types.ObjectId(user.userId)}},
          {
            $lookup: {
              from: "farmers",
              localField: "_id",
              foreignField: "field_officer",
              as: "farmers",
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              role: 1,
              supervisor: 1,
              farmers: {$size: "$farmers"},
            },
          },
        ])
        .sort({createdAt: -1})
      if (!users) {
        return res.status(404).send({error: true, message: "No records found"})
      }
      return res.status(200).send({
        error: false,
        message: "Success",
        data: users,
      })
    }
    const users = await userModel
      .aggregate([
        {$match: {role: "FIELD OFFICER"}},
        {
          $lookup: {
            from: "farmers",
            localField: "_id",
            foreignField: "field_officer",
            as: "farmers",
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            role: 1,
            supervisor: 1,
            farmers: {$size: "$farmers"},
          },
        },
      ])
      .sort({createdAt: -1})
      .limit(Number(queries.limit))
    if (!users) {
      return res.status(404).send({error: true, message: "No records found"})
    }
    return res.status(200).send({
      error: false,
      message: "Success",
      data: users,
    })
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}
