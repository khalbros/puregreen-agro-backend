import {Request, Response} from "express"
import {cooperativeModel, farmerModel} from "../models"
import {ICooperative} from "../types/cooperative"
import {currentUser, getUserRole} from "../utils"
import mongoose from "mongoose"

export const createCooperative = async (req: Request, res: Response) => {
  try {
    const {name, chairman, village, village_head, phone}: ICooperative =
      req.body

    if (!name || !chairman || !village || !village_head || !phone) {
      return res.status(400).send({
        error: true,
        message: "inputs error (some fields are empty / invalid)",
      })
    }
    const nameCheck = await cooperativeModel.findOne({name: name.toLowerCase()})
    if (nameCheck)
      return res
        .status(400)
        .send({error: true, message: "cooperative already exist"})

    const newCooperative = await cooperativeModel.create({
      name: name.toLowerCase(),
      chairman: chairman.toLowerCase(),
      village: village.toLowerCase(),
      village_head: village_head.toLowerCase(),
      phone,
    })

    newCooperative
      .save()
      .then(
        () => {
          return res
            .status(201)
            .send({error: false, message: "cooperative created successfully"})
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

export const getCooperative = async (req: Request, res: Response) => {
  try {
    const userRole = await getUserRole(req, res)
    const {id} = req.params
    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please set a search key (ID not found)",
      })
    }

    const cooperative =
      userRole != "SUPER ADMIN" && userRole != "ADMIN"
        ? await cooperativeModel
            .findById({_id: id, isApproved: true})
            .populate("team")
            .populate({path: "team", populate: {path: "supervisor"}})
            .populate("supervisor")
        : await cooperativeModel
            .findById(id)
            .populate("team")
            .populate({path: "team", populate: {path: "supervisor"}})
            .populate("supervisor")
    if (!cooperative) {
      return res.status(404).send({
        error: true,
        message: "Cooperative not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "Success", data: cooperative})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const getAllCooperatives = async (req: Request, res: Response) => {
  try {
    const cooperatives = await cooperativeModel
      .find()
      .populate("team")
      .populate({path: "team", populate: {path: "supervisor"}})
      .populate("supervisor")
      .sort({createdAt: -1})
    if (!cooperatives) {
      return res.status(404).send({
        error: true,
        message: "Cooperative not found",
      })
    }
    return res
      .status(200)
      .send({error: false, message: "Success", data: cooperatives})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}
export const getAllApprovedCooperatives = async (
  req: Request,
  res: Response
) => {
  try {
    const cooperatives = await cooperativeModel
      .find({isApproved: true})
      .populate("team")
      .populate({path: "team", populate: {path: "supervisor"}})
      .populate("supervisor")
      .sort({createdAt: -1})
    if (!cooperatives) {
      return res.status(404).send({
        error: true,
        message: "Cooperative not found",
      })
    }
    return res
      .status(200)
      .send({error: false, message: "Success", data: cooperatives})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const updateCooperative = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    const user_role = await getUserRole(req, res)

    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please pass an ID to query",
      })
    }

    if (user_role !== "ADMIN" && user_role !== "SUPER ADMIN") {
      return res.status(401).send({
        error: true,
        message: "Only admin edit cooperative data",
      })
    }

    const cooperative = await cooperativeModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!cooperative) {
      return res.status(404).send({
        error: true,
        message: "Cooperative not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "Cooperative updated", data: cooperative})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const deleteCooperative = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    const user_role = await getUserRole(req, res)

    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please pass an ID to query",
      })
    }

    if (user_role !== "SUPER ADMIN") {
      return res.status(403).send({
        error: true,
        message: "Only Super admin can delete cooperative",
      })
    }

    const cooperative = await cooperativeModel.findByIdAndDelete(id)
    if (!cooperative) {
      return res.status(404).send({
        error: true,
        message: "Cooperative not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "Cooperative Deleted", data: cooperative})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const countCooperativies = async (req: Request, res: Response) => {
  const user = await currentUser(req, res)
  try {
    if (user?.role === "SUPERVISOR") {
      const farmers = await cooperativeModel
        .find({supervisor: user?.userId})
        .count()

      return res
        .status(200)
        .send({error: false, message: "Success", data: farmers})
    }
    const cooperativies = await cooperativeModel.find().count()
    return res
      .status(200)
      .send({error: false, message: "Success", data: cooperativies})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const countVerifiedCooperativies = async (
  req: Request,
  res: Response
) => {
  const user = await currentUser(req, res)
  try {
    const cooperativies = await cooperativeModel
      .find({isApproved: true})
      .count()
    return res
      .status(200)
      .send({error: false, message: "Success", data: cooperativies})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const countUnverifiedCooperativies = async (
  req: Request,
  res: Response
) => {
  const user = await currentUser(req, res)
  try {
    const cooperativies = await cooperativeModel
      .find({isApproved: false})
      .count()
    return res
      .status(200)
      .send({error: false, message: "Success", data: cooperativies})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const getCooperativeMembers = async (req: Request, res: Response) => {
  const {id} = req.params
  try {
    const cooperatives = await farmerModel
      .find({cooperative: id, isApproved: true})
      .sort({createAt: -1})

    if (!cooperatives) {
      return res.status(404).send({
        error: true,
        message: "Cooperative not found",
      })
    }
    return res
      .status(200)
      .send({error: false, message: "Success", data: cooperatives})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}
export const countCooperativeMembers = async (req: Request, res: Response) => {
  const {id} = req.params
  try {
    const cooperatives = await farmerModel
      .find({cooperative: id, isApproved: true})
      .count()

    if (!cooperatives) {
      return res.status(404).send({
        error: true,
        message: "Cooperative not found",
      })
    }
    return res
      .status(200)
      .send({error: false, message: "Success", data: cooperatives})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}
export const getCooperativeMembersWithCount = async (
  req: Request,
  res: Response
) => {
  const queries = req.query
  const user = await currentUser(req, res)
  try {
    if (user?.role === "SUPERVISOR") {
      const cooperatives = await cooperativeModel.aggregate([
        {$match: {supervisor: new mongoose.Types.ObjectId(user.userId)}},
        {
          $lookup: {
            from: "farmers",
            localField: "_id",
            foreignField: "cooperative",
            as: "farmers",
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            team: 1,
            farmers: {$size: "$farmers"},
          },
        },
      ])

      if (!cooperatives) {
        return res.status(404).send({
          error: true,
          message: "Cooperative not found",
        })
      }

      return res
        .status(200)
        .send({error: false, message: "Success", data: cooperatives})
    }
    const cooperatives = await cooperativeModel.aggregate([
      {
        $lookup: {
          from: "farmers",
          localField: "_id",
          foreignField: "cooperative",
          as: "members",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          team: {$arrayElemAt: ["$team", 0]},
          members: {$size: "members"},
        },
      },
    ])

    if (!cooperatives) {
      return res.status(404).send({
        error: true,
        message: "Cooperative not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "Success", data: cooperatives})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const getCooperativeBySupervisor = async (
  req: Request,
  res: Response
) => {
  const {id} = req.params
  try {
    const cooperatives = await cooperativeModel
      .find({
        supervisor: id,
      })
      .populate("team")
      .populate({path: "team", populate: {path: "supervisor"}})
      .populate("supervisor")
      .sort({createdAt: -1})

    if (!cooperatives) {
      return res.status(404).send({
        error: true,
        message: "Cooperative not found",
      })
    }
    return res
      .status(200)
      .send({error: false, message: "Success", data: cooperatives})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}
export const countCooperativeBySupervisor = async (
  req: Request,
  res: Response
) => {
  const {id} = req.params
  try {
    const cooperatives = await cooperativeModel
      .find({
        supervisor: id,
      })
      .count()

    if (!cooperatives) {
      return res.status(404).send({
        error: true,
        message: "Cooperative not found",
      })
    }
    return res
      .status(200)
      .send({error: false, message: "Success", data: cooperatives})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}
