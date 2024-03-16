import {Request, Response} from "express"
import {farmerModel, userModel} from "../models"
import {equityModel} from "../models/equity.model"
import {currentUser, getUserId} from "../utils"
import {IEquity} from "../types/equity"

export const equityPayment = async (req: Request, res: Response) => {
  try {
    const cuser = await getUserId(req, res)
    const user = await userModel.findById(cuser)

    const {farmer, amount_paid}: IEquity = req.body

    if (!farmer || !amount_paid) {
      return res.status(400).send({
        error: true,
        message: "Error (some fields are empty / invalid)",
      })
    }

    const farmaerCheck = await farmerModel.findOne({farmer_id: farmer})
    if (!farmaerCheck)
      return res.status(404).send({error: true, message: `Farmer Not Found`})

    const newFarmer = await equityModel.create({
      farmer: farmaerCheck._id,
      amount_paid,
      status: "PAID",
      paid_by: user?._id,
    })

    newFarmer
      .save()
      .then(
        async () => {
          farmaerCheck.equity_amount = amount_paid
          await farmaerCheck.save()
          return res
            .status(201)
            .send({error: false, message: "Payment successfully"})
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

export const getEquity = async (req: Request, res: Response) => {
  const userID = await currentUser(req, res)
  const user = await userModel.findById(userID?.userId)
  const {project} = req.query
  try {
    if (user?.role === "FINANCIAL OFFICER") {
      const disburse = project
        ? await equityModel
            .find({
              paid_by: user?._id,
            })
            .populate("farmer")
            .populate("paid_by")
            .sort({createdAt: -1})
        : await equityModel
            .find({
              paid_by: user?._id,
            })
            .populate("farmer")
            .populate("paid_by")
            .sort({createdAt: -1})

      if (!disburse) {
        return res.status(200).send({error: false, message: "not found"})
      }

      return res
        .status(200)
        .send({error: false, message: "Success", data: disburse})
    }

    const disburse = project
      ? await equityModel
          .find({project})
          .populate("farmer")
          .populate("paid_by")
          .sort({createdAt: -1})
      : await equityModel
          .find()
          .populate("farmer")
          .populate("paid_by")
          .sort({createdAt: -1})

    if (!disburse) {
      return res.status(200).send({error: false, message: "not found"})
    }

    return res
      .status(200)
      .send({error: false, message: "Success", data: disburse})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const updateEquityPayment = async (req: Request, res: Response) => {
  try {
    const {id} = req.params

    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please pass an ID to query",
      })
    }

    const farmer = await equityModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!farmer) {
      return res.status(404).send({
        error: true,
        message: "Not found",
      })
    }
    const farmaerCheck = await farmerModel.findOne({_id: farmer.farmer})
    if (farmaerCheck) {
      farmaerCheck.equity_amount = farmer?.amount_paid

      await farmaerCheck.save()
    }

    return res.status(200).send({
      error: false,
      message: "Payment Updated Successfully",
      data: farmer,
    })
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const deleteEquityPayment = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please pass an ID to query (No ID found)",
      })
    }

    const payment = await equityModel.findByIdAndDelete(id)
    if (!payment) {
      return res.status(404).send({
        error: true,
        message: "payment not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "Deleted Successfully", data: payment})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const countEquity = async (req: Request, res: Response) => {
  const userID = await currentUser(req, res)
  const user = await userModel.findById(userID?.userId)
  const {project} = req.query
  try {
    if (user?.role === "FINANCIAL OFFICER") {
      const disburse = project
        ? await equityModel.find({
            paid_by: user?._id,
          })
        : await equityModel.find({
            paid_by: user?._id,
          })

      if (!disburse) {
        return res.status(200).send({error: false, message: "not found"})
      }
      const netweight = disburse.reduce(
        (total, d) => total + Number(d.amount_paid),
        0
      )
      return res
        .status(200)
        .send({error: false, message: "Success", data: netweight})
    }

    const disburse = project
      ? await equityModel.find({project})
      : await equityModel.find()

    if (!disburse) {
      return res.status(200).send({error: false, message: "not found"})
    }
    const netweight = disburse.reduce(
      (total, d) => total + Number(d.amount_paid),
      0
    )
    return res
      .status(200)
      .send({error: false, message: "Success", data: netweight})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}
