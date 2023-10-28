import {Request, Response} from "express"
import {
  commodityModel,
  dispatchModel,
  userModel,
  warehouseModel,
} from "../models"
import {ICommodity} from "../types/commodity"
import {getUserId, getUserRole} from "../utils"

export const createCommodity = async (req: Request, res: Response) => {
  try {
    const {name, price}: ICommodity = req.body

    if (!name || !price) {
      return res.status(400).send({
        error: true,
        message: "commodities error (some fields are empty / invalid)",
      })
    }
    const nameCheck = await commodityModel.findOne({
      name: name.toLowerCase(),
    })
    if (nameCheck) {
      return res
        .status(400)
        .send({error: true, message: "commodity already exist"})
    }

    const newCommodity = await commodityModel.create({
      name: name.toLowerCase(),
      price,
    })

    newCommodity
      .save()
      .then(
        () => {
          return res
            .status(201)
            .send({error: false, message: "commodity created successfully"})
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

export const getCommodity = async (req: Request, res: Response) => {
  try {
    const userRole = await getUserRole(req, res)
    const {id} = req.params
    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please set a search key (ID not found)",
      })
    }

    const commodity =
      userRole != "SUPER ADMIN" && userRole != "ADMIN"
        ? await commodityModel
            .findById({_id: id, isApproved: true})
            .populate("grade")
        : await commodityModel.findById(id).populate("grade")
    if (!commodity) {
      return res.status(404).send({
        error: true,
        message: "Commodity not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "Success", data: commodity})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const getAllApprovedCommodities = async (
  req: Request,
  res: Response
) => {
  try {
    const commodities = await commodityModel
      .find({isApproved: true})
      .populate("grade")
      .sort({createAt: -1})
    if (!commodities) {
      return res.status(404).send({
        error: true,
        message: "Commodity not found",
      })
    }
    return res
      .status(200)
      .send({error: false, message: "Success", data: commodities})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const getAllCommodities = async (req: Request, res: Response) => {
  try {
    const commodities = await commodityModel
      .find()
      .populate("grade")
      .sort({createAt: -1})
    if (!commodities) {
      return res.status(404).send({
        error: true,
        message: "Commodity not found",
      })
    }
    return res
      .status(200)
      .send({error: false, message: "Success", data: commodities})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const updateCommodity = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please pass an ID to query",
      })
    }

    const commodity = await commodityModel
      .findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      })
      .populate("grade")
      .sort({createAt: -1})
    if (!commodity) {
      return res.status(404).send({
        error: true,
        message: "Commodity not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "Commodity updated", data: commodity})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const deleteCommodity = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    const user_role = await getUserRole(req, res)

    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please pass an ID to query",
      })
    }

    const commodity = await commodityModel.findByIdAndDelete(id)
    if (!commodity) {
      return res.status(404).send({
        error: true,
        message: "Commodity not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "Commodity Deleted", data: commodity})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const getCommodityByWarehouse = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please set a search key (ID not found)",
      })
    }

    const warehouse = await warehouseModel
      .findById(id)
      .populate("warehouse_manager")
      .populate("supervisors")
      .populate("commodities.commodity")
      .populate("commodities.grade")
      .sort({createAt: -1})

    if (!warehouse) {
      return res.status(404).send({
        error: true,
        message: "Warehouse not found",
      })
    }

    const commodities = warehouse.commodities
    return res
      .status(200)
      .send({error: false, message: "Success", data: commodities})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

// action

// counts
export const countCommoditiesReceived = async (req: Request, res: Response) => {
  const userId = await getUserId(req, res)
  const user = await userModel.findById(userId)
  if (!user) {
    return res.status(404).send({
      error: true,
      message: "User not found",
    })
  }
  try {
    const dispatchs = await dispatchModel.find({warehouse: user?.warehouse})
    if (!dispatchs) {
      return res.status(404).send({
        error: true,
        message: "Dispatch not found",
      })
    }
    const weight = dispatchs.reduce(
      (total, d) => total + Number(d.gross_weight),
      0
    )
    const bags = dispatchs.reduce((total, d) => total + Number(d.num_bags), 0)
    return res
      .status(200)
      .send({error: false, message: "Success", data: {weight, bags}})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const countCommoditiesOut = async (req: Request, res: Response) => {
  const userId = await getUserId(req, res)
  const user = await userModel.findById(userId)
  if (!user) {
    return res.status(404).send({
      error: true,
      message: "User not found",
    })
  }
  try {
    const dispatchs = await dispatchModel.find({createdBy: user?._id})
    if (!dispatchs) {
      return res.status(404).send({
        error: true,
        message: "Dispatch not found",
      })
    }
    const weight = dispatchs.reduce(
      (total, d) => total + Number(d.gross_weight),
      0
    )
    const bags = dispatchs.reduce((total, d) => total + Number(d.num_bags), 0)
    return res
      .status(200)
      .send({error: false, message: "Success", data: {weight, bags}})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}
