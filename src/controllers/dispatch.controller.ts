import {Request, Response} from "express"
import {clientModel, dispatchModel, userModel, warehouseModel} from "../models"
import {IDispatch} from "../types/dispatch"
import {currentUser, generateOTP, getUserId, getUserRole} from "../utils"
import bcryptjs from "bcryptjs"
import {otpModel} from "../models/Otp.model"
import {activeSockets} from ".."
import {sendEmail} from "../utils/send-mail"

export const createDispatch = async (req: Request, res: Response) => {
  try {
    const {
      type,
      commodity,
      client,
      warehouse,
      gross_weight,
      num_bags,
      driver,
      truck_num,
    }: IDispatch = req.body

    if (
      !type ||
      !num_bags ||
      !gross_weight ||
      !commodity ||
      !driver ||
      !truck_num
    ) {
      return res.status(400).send({
        error: true,
        message: "dispatchs error (some fields are empty / invalid)",
      })
    }
    if (!client && !warehouse) {
      return res.status(400).send({
        error: true,
        message: "dispatchs error (missing client id / warehouse)",
      })
    }

    const selectedClient = await clientModel.findOne({client_id: client})
    if (client && !selectedClient) {
      return res.status(400).send({
        error: true,
        message: "error invalid client",
      })
    }
    const newDispatch = await dispatchModel.create({
      ...req.body,
      client: client && selectedClient?._id,
      createdBy: await getUserId(req, res),
    })

    newDispatch
      .save()
      .then(
        () => {
          return res
            .status(201)
            .send({error: false, message: "dispatch created successfully"})
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

export const getDispatch = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please set a search key (ID not found)",
      })
    }

    const dispatch = await dispatchModel
      .findById(id)
      .sort({createdAt: -1})
      .populate("warehouse")
      .populate("client")
      .populate("commodity")
      .populate({path: "commodity", populate: {path: "grade"}})
      .populate("createdBy")
    if (!dispatch) {
      return res.status(404).send({
        error: true,
        message: "Dispatch not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "Success", data: dispatch})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const getAllDispatches = async (req: Request, res: Response) => {
  const userId = await getUserId(req, res)
  const user = await userModel.findById(userId)
  if (!user) {
    return res.status(404).send({
      error: true,
      message: "User not found",
    })
  }
  const {type} = req.query
  try {
    if (user.role === "SUPER ADMIN" || user.role === "ADMIN") {
      if (type && type != "") {
        const dispatchs = await dispatchModel
          .find({
            type,
          })
          .sort({createdAt: -1})
          .populate("warehouse")
          .populate("client")
          .populate("commodity")
          .populate({path: "commodity", populate: {path: "grade"}})
          .populate("createdBy")
        if (!dispatchs) {
          return res.status(404).send({
            error: true,
            message: "Dispatch not found",
          })
        }
        return res
          .status(200)
          .send({error: false, message: "Success", data: dispatchs})
      }
      const dispatchs = await dispatchModel
        .find()
        .sort({createdAt: -1})
        .populate("warehouse")
        .populate("client")
        .populate("commodity")
        .populate({path: "commodity", populate: {path: "grade"}})
        .populate("createdBy")
      if (!dispatchs) {
        return res.status(404).send({
          error: true,
          message: "Dispatch not found",
        })
      }
      return res
        .status(200)
        .send({error: false, message: "Success", data: dispatchs})
    }
    if (type && type != "") {
      const dispatchs = await dispatchModel
        .find({
          $or: [{warehouse: user?.warehouse}, {createdBy: user._id}],
          type,
        })
        .sort({createdAt: -1})
        .populate("warehouse")
        .populate("client")
        .populate("commodity")
        .populate({path: "commodity", populate: {path: "grade"}})
        .populate("createdBy")
      if (!dispatchs) {
        return res.status(404).send({
          error: true,
          message: "Dispatch not found",
        })
      }
      return res
        .status(200)
        .send({error: false, message: "Success", data: dispatchs})
    }
    const dispatchs = await dispatchModel
      .find({$or: [{warehouse: user?.warehouse}, {createdBy: user._id}]})
      .sort({createdAt: -1})
      .populate("warehouse")
      .populate("client")
      .populate("commodity")
      .populate({path: "commodity", populate: {path: "grade"}})
      .populate("createdBy")
    if (!dispatchs) {
      return res.status(404).send({
        error: true,
        message: "Dispatch not found",
      })
    }
    return res
      .status(200)
      .send({error: false, message: "Success", data: dispatchs})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const updateDispatch = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please pass an ID to query",
      })
    }

    const dispatch = await dispatchModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!dispatch) {
      return res.status(404).send({
        error: true,
        message: "Dispatch not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "Dispatch updated", data: dispatch})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const deleteDispatch = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    const user_role = await getUserRole(req, res)

    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please pass an ID to query",
      })
    }

    const dispatch = await dispatchModel.findByIdAndDelete(id)
    if (!dispatch) {
      return res.status(404).send({
        error: true,
        message: "Dispatch not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "Dispatch Deleted", data: dispatch})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

//  actions

export const approveDispatch = async (req: Request, res: Response) => {
  const currentuser = await currentUser(req, res)
  try {
    const {id} = req.params
    const {isApproved}: IDispatch = req.body
    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please pass an ID to query",
      })
    }

    const dispatch = await dispatchModel.findByIdAndUpdate(
      id,
      {isApproved, status: isApproved ? "APPROVED" : "REJECTED"},
      {
        new: true,
        runValidators: true,
      }
    )

    if (!dispatch) {
      return res.status(400).send({
        error: true,
        message: "Error updating dispatch",
      })
    }
    if (dispatch.status === "APPROVED") {
      const otp = await generateOTP()
      const hash_otp = await bcryptjs.hash(otp as string, 12)

      const newOtp = await otpModel.create({
        otp: hash_otp,
        dispatch_id: dispatch._id,
        expire_in: Date.now() + 300000,
      })
      if (!newOtp) {
        return res.status(400).send({
          error: true,
          message: "Error saving otp",
        })
      }
      let dispatch_for

      if (dispatch.type === "Inter warehouse") {
        const warehouse = await warehouseModel.findById(dispatch.warehouse)
        dispatch_for = warehouse?.name
      }
      if (dispatch.type === "Trading") {
        const client = await clientModel.findById(dispatch.client)
        dispatch_for = client?.name
      }
      await newOtp.save()
      const targetSocket = activeSockets[String(dispatch.createdBy)]

      const mailTO = await userModel.findById(dispatch.createdBy)
      if (mailTO) {
        await sendEmail({
          to: mailTO.email as string,
          subject: "DISPATCH APPROVED",
          message: `<p>Your Dispatch for <h4>${dispatch_for}</h4> has been Approved</p><p>please use this code: <h3>${otp}</h3> to complete your dispatch<p/>`,
        })
      }

      if (targetSocket) {
        targetSocket.emit("dispatch-treated", {
          message: `Dispatch APPROVED for ${dispatch_for}`,
          otp,
        })
      }
      return res
        .status(200)
        .send({error: false, message: "Dispatch updated", data: dispatch})
    }

    let dispatch_for

    if (dispatch.type === "Inter warehouse") {
      const warehouse = await warehouseModel.findById(dispatch.warehouse)
      dispatch_for = warehouse?.name
    }
    if (dispatch.type === "Trading") {
      const client = await clientModel.findById(dispatch.client)
      dispatch_for = client?.name
    }
    const targetSocket = activeSockets[String(dispatch.createdBy)]

    const mailTO = await userModel.findById(dispatch.createdBy)
    if (mailTO) {
      await sendEmail({
        to: mailTO.email as string,
        subject: "DISPATCH APPROVED",
        message: `<p>Your Dispatch for <h4>${dispatch_for}</h4> has been Rejected</p><p>please contact admin <h3>${currentuser?.name}</h3> for more informantion<p/>`,
      })
    }

    if (targetSocket) {
      targetSocket.emit("dispatch-treated", {
        message: `Dispatch for ${dispatch_for} has been REJECTED`,
      })
    }
    return res
      .status(200)
      .send({error: false, message: "Dispatch updated", data: dispatch})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const veriifyDispatch = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    const {otp} = req.body
    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please pass an ID to query",
      })
    }
    if (!otp) {
      return res.status(400).send({
        error: true,
        message: "Error Please enter verification OTP",
      })
    }

    const otpFind = await otpModel.findOne({dispatch_id: id})
    if (!otpFind) {
      return res.status(400).send({
        error: true,
        message: "Error no OTP generated for this dispatch",
      })
    }
    const otpCheck = await bcryptjs.compare(otp, otpFind?.otp as string)

    if (!otpCheck) {
      return res.status(400).send({
        error: true,
        message: "Error Invalid OTP",
      })
    }
    const dispatch = await dispatchModel.findByIdAndUpdate(
      id,
      {status: "VERIFIED"},
      {
        new: true,
        runValidators: true,
      }
    )

    if (!dispatch) {
      return res.status(400).send({
        error: true,
        message: "Error updating dispatch",
      })
    }
    await otpModel.findOneAndDelete({dispatch_id: id})

    if (dispatch.type === "Trading") {
      const warehouse = await warehouseModel.findOne({
        warehouse_manager: dispatch.createdBy,
      })

      if (!warehouse) {
        return res.send({error: true, message: "Dispatch Warehouse not found"})
      }
      const comm = warehouse?.commodities.find((commodity) => {
        commodity.commodity === dispatch.commodity
      })
      if (comm) {
        warehouse.commodities = warehouse?.commodities.map((commodity) => {
          if (commodity.commodity === dispatch.commodity) {
            commodity.quantity =
              Number(commodity.quantity) - Number(dispatch.num_bags)
            commodity.weight =
              Number(commodity.weight) - Number(dispatch.gross_weight)
          } else {
            commodity
          }
        }) as never
        await warehouse.save()
      } else {
        warehouse.commodities.push({
          commodity: dispatch.commodity,
          quantity: dispatch.num_bags as number,
          weight: Number(dispatch.gross_weight),
        })
        warehouse.save()
      }
      await dispatchModel.findByIdAndUpdate(
        id,
        {status: "COMPLETED"},
        {
          new: true,
          runValidators: true,
        }
      )
    }

    return res
      .status(200)
      .send({error: false, message: "Dispatch updated", data: dispatch})
  } catch (error: any) {
    return res.send({error: true, message: error?.message})
  }
}

export const confirmDispatch = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    const {isReceived} = req.body

    const dispatch = await dispatchModel.findByIdAndUpdate(
      id,
      {status: isReceived ? "COMPLETED" : "REJECTED", isReceived},
      {
        new: true,
        runValidators: true,
      }
    )

    if (!dispatch) {
      return res.status(400).send({
        error: true,
        message: "Error updating dispatch",
      })
    }
    if (isReceived) {
      const senderWarehouse = await warehouseModel.findOne({
        warehouse_manager: dispatch.createdBy,
      })
      senderWarehouse?.commodities ===
        senderWarehouse?.commodities.map((commodity) => {
          if (commodity.commodity === dispatch.commodity) {
            commodity.quantity =
              Number(commodity.quantity) - Number(dispatch.num_bags)
            commodity.weight =
              Number(commodity.weight) - Number(dispatch.gross_weight)
          }
        })
      senderWarehouse?.save()

      const receiverWarehouse = await warehouseModel.findById(
        dispatch.warehouse
      )

      const comm = receiverWarehouse?.commodities.find(
        (commodity) => commodity.commodity === dispatch.commodity
      )

      if (comm) {
        receiverWarehouse?.commodities.map((commodity) => {
          if (commodity.commodity === dispatch.commodity) {
            commodity.quantity =
              Number(commodity.quantity) + Number(dispatch.num_bags)
            commodity.weight =
              Number(commodity.weight) + Number(dispatch.gross_weight)
          } else {
            commodity
          }
        })
        receiverWarehouse?.save()
      } else {
        receiverWarehouse?.commodities.push({
          commodity: dispatch.commodity,
          quantity: dispatch.num_bags as number,
          weight: Number(dispatch.gross_weight),
        })
        receiverWarehouse?.save()
      }
    }
    return res
      .status(200)
      .send({error: false, message: "Dispatch updated", data: dispatch})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}
