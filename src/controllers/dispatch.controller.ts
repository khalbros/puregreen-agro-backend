import {Request, Response} from "express"
import {
  clientModel,
  dispatchModel,
  inputModel,
  userModel,
  warehouseModel,
} from "../models"
import {IDispatch} from "../types/dispatch"
import {
  currentUser,
  generateOTP,
  generateRefID,
  getUserId,
  getUserRole,
} from "../utils"
import bcryptjs from "bcryptjs"
import {otpModel} from "../models/Otp.model"
import {activeSockets} from ".."
import {sendEmail} from "../utils/send-mail"
import {ICommodity} from "../types/commodity"
import {IGrade} from "../types/grade"
import {IUser} from "../types/user"
import {IInput} from "../types/input"

export const createDispatch = async (req: Request, res: Response) => {
  try {
    const {
      type,
      item,
      item_type,
      client,
      warehouse,
      gross_weight,

      num_bags,
      driver,
      truck_num,
    }: IDispatch = req.body

    if (!type || !num_bags || !item || !driver || !truck_num) {
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
      input: item_type === "input" ? item : null,
      commodity: item_type === "commodity" ? item : null,
      ref_id: await generateRefID(),
      client: client && selectedClient?._id,
      createdBy: await getUserId(req, res),
    })

    newDispatch
      .save()
      .then(
        (result) => {
          return res.status(201).send({
            error: false,
            message: "dispatch created successfully",
            data: result,
          })
        },
        (err) => {
          return res.status(400).send({error: true, message: err?.message})
        }
      )
      .catch((err) => {
        return res.status(400).send({error: true, message: err?.message})
      })
  } catch (error: any) {
    return res.status(400).send({error: true, message: error?.message})
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
      .populate("input")
      .populate("grade")
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
    res.status(400).send({error: true, message: error?.message})
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
    if (user.role === "SUPER ADMIN" || user.role === "DATA ANALYST") {
      if (type && type != "") {
        const dispatchs = await dispatchModel
          .find({
            type,
          })
          .sort({createdAt: -1})
          .populate("warehouse")
          .populate("client")
          .populate("commodity")
          .populate("input")
          .populate("grade")
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
        .populate("input")
        .populate("grade")
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
        .populate("input")
        .populate("grade")
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
      .populate("input")
      .populate("grade")
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
    res.status(400).send({error: true, message: error?.message})
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
    res.status(400).send({error: true, message: error?.message})
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
    res.status(400).send({error: true, message: error?.message})
  }
}

export const getItems = async (req: Request, res: Response) => {
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
      .populate("commodities.commodity")
      .populate("commodities.grade")
      .sort({createAt: -1})

    if (!warehouse) {
      return res.status(404).send({
        error: true,
        message: "Warehouse not found",
      })
    }

    const commodities = warehouse.commodities.map((com) => ({
      _id: com.commodity?._id,
      name: (com.commodity as unknown as ICommodity)?.name,
      grade: (com.grade as unknown as IGrade)?.name,
      quantity: com.quantity,
      type: "commodity",
    }))

    const w_inputs = await inputModel.find({warehouse: id})

    const inputs = w_inputs.map((input) => ({
      _id: input._id,
      name: input.name,
      quantity: input.quantity,
      type: "input",
    }))
    const d_comm = commodities.filter(
      (obj, index, self) => index === self.findIndex((t) => t.name === obj.name)
    )
    const items = [...d_comm, ...inputs]
    return res.status(200).send({error: false, message: "Success", data: items})
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
      const user = await userModel.findById(dispatch.createdBy)

      const newOtp = await otpModel.create({
        otp: hash_otp,
        dispatch_id: dispatch._id,
        expire_in: Date.now() + 300000,
        user: user?.email,
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
          message: `<p>Your Dispatch for <h4 style={display:"inline-block"}>${dispatch_for}</h4> has been Approved</p><p>please use this code: <h3 style={display:"inline-block"}>${otp}</h3> to complete your dispatch<p/>`,
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
        subject: "DISPATCH REJECTED",
        message: `<p>Your Dispatch for <h4 style={display:"inline-block"}>${dispatch_for}</h4> has been Rejected</p><p>please contact admin <h3 style={display:"inline-block"}>${currentuser?.name}</h3> for more informantion<p/>`,
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
    res.status(400).send({error: true, message: error?.message})
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
        return res
          .status(400)
          .send({error: true, message: "Dispatch Warehouse not found"})
      }

      if (dispatch.commodity && dispatch.commodity != null) {
        if (warehouse.commodities.length < 1) {
          dispatchModel
            .findByIdAndUpdate(
              id,
              {status: "FAILED"},
              {
                new: true,
                runValidators: true,
              }
            )
            .then(() =>
              res.send({
                error: true,
                message: `Dispatch Failed, No Enough Commodities In Warehouse`,
              })
            )
        }
        warehouse.commodities = warehouse?.commodities.map((commodity) => {
          if (
            String(commodity.commodity) === String(dispatch.commodity) &&
            String(commodity.grade) === String(dispatch.grade)
          ) {
            if (
              Number(
                Number(commodity.quantity) - Number(Number(dispatch?.num_bags))
              ) < 0
            ) {
              dispatchModel
                .findByIdAndUpdate(
                  id,
                  {status: "FAILED"},
                  {
                    new: true,
                    runValidators: true,
                  }
                )
                .then(() =>
                  res.send({
                    error: true,
                    message: `Dispatch Failed No Enough Commodities In Warehouse`,
                  })
                )
            }
            commodity.quantity =
              Number(commodity.quantity) - Number(Number(dispatch?.num_bags))
            commodity.weight =
              Number(commodity.weight) - Number(dispatch.gross_weight)
            commodity.net_weight =
              Number(commodity.net_weight) - Number(dispatch.net_weight)
            return commodity
          } else {
            return commodity
          }
        }) as never
        await warehouse.save()

        await dispatchModel.findByIdAndUpdate(
          id,
          {status: "COMPLETED"},
          {
            new: true,
            runValidators: true,
          }
        )
        return res
          .status(200)
          .send({error: false, message: "Dispatch completed", data: dispatch})
      }

      if (dispatch.input && dispatch.input != null) {
        const warehouseInput = await inputModel.findById(dispatch.input)
        if (!warehouseInput) {
          await dispatchModel.findByIdAndUpdate(
            id,
            {status: "FAILED"},
            {
              new: true,
              runValidators: true,
            }
          )
          return res.send({
            error: true,
            message: "no input found",
          })
        }
        if (Number(warehouseInput.quantity - Number(dispatch?.num_bags)) < 0) {
          await dispatchModel.findByIdAndUpdate(
            id,
            {status: "FAILED"},
            {
              new: true,
              runValidators: true,
            }
          )
          return res.status(400).send({
            error: true,
            message: "no enough input in warehouse",
          })
        }
        warehouseInput.quantity =
          warehouseInput.quantity - Number(dispatch?.num_bags)
        warehouseInput.quantity_out = warehouseInput.quantity_out
          ? warehouseInput.quantity_out + Number(dispatch?.num_bags)
          : Number(dispatch?.num_bags)

        await warehouseInput.save()
        await dispatchModel.findByIdAndUpdate(
          id,
          {status: "COMPLETED"},
          {
            new: true,
            runValidators: true,
          }
        )
        return res
          .status(200)
          .send({error: false, message: "Dispatch Completed", data: dispatch})
      }
    }
    return res
      .status(200)
      .send({error: false, message: "Dispatch updated", data: dispatch})
  } catch (error: any) {
    return res.status(400).send({error: true, message: error?.message})
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
      if (dispatch.commodity) {
        senderWarehouse?.commodities ===
          senderWarehouse?.commodities.map((commodity) => {
            if (
              String(commodity.commodity) === String(dispatch.commodity) &&
              String(commodity.grade) === String(dispatch.grade)
            ) {
              commodity.quantity =
                Number(commodity.quantity) - Number(Number(dispatch?.num_bags))
              commodity.weight =
                Number(commodity.weight) - Number(dispatch.gross_weight)
              commodity.net_weight =
                Number(commodity.net_weight) - Number(dispatch.net_weight)
            }
          })
        senderWarehouse?.save()

        const receiverWarehouse = await warehouseModel.findById(
          dispatch.warehouse
        )

        const comm = receiverWarehouse?.commodities.find(
          (commodity) =>
            String(commodity.commodity) === String(dispatch.commodity)
        )

        if (comm) {
          receiverWarehouse?.commodities.map((commodity) => {
            if (
              String(commodity.commodity) === String(dispatch.commodity) &&
              String(commodity.grade) === String(dispatch.grade)
            ) {
              commodity.quantity =
                Number(commodity.quantity) + Number(Number(dispatch?.num_bags))
              commodity.weight =
                Number(commodity.weight) + Number(dispatch.gross_weight)
              commodity.net_weight =
                Number(commodity.net_weight) + Number(dispatch.net_weight)
            } else {
              commodity
            }
          })
          await receiverWarehouse?.save()
        } else {
          receiverWarehouse?.commodities.push({
            commodity: dispatch.commodity,
            quantity: Number(dispatch?.num_bags) as number,
            weight: Number(dispatch.gross_weight),
            net_weight: Number(dispatch.net_weight),
          })
          await receiverWarehouse?.save()
        }
      }
      if (dispatch.input && dispatch.input != null) {
        const w_input = await inputModel.findById(dispatch.input)
        if (!w_input) {
          await dispatchModel.findByIdAndUpdate(
            id,
            {status: "FAILED", isReceived: false},
            {
              new: true,
              runValidators: true,
            }
          )
          return res.status(400).send({
            error: true,
            message: "Input not found",
          })
        }
        if (Number(w_input.quantity - Number(dispatch?.num_bags)) < 0) {
          await dispatchModel.findByIdAndUpdate(
            id,
            {status: "FAILED", isReceived: false},
            {
              new: true,
              runValidators: true,
            }
          )
          return res.status(400).send({
            error: true,
            message: "NO ENOUGH INPUTS IN WAREHOUSE",
          })
        }
        w_input.quantity = w_input.quantity - Number(dispatch?.num_bags)
        w_input.quantity_out = w_input.quantity_out
          ? w_input.quantity_out + Number(dispatch?.num_bags)
          : Number(dispatch?.num_bags)
        await w_input.save()

        const rw_input = await inputModel.findById(dispatch.input)
        if (!rw_input) {
          const input_n = await dispatchModel.findById(id).populate("input")
          const input = await inputModel.create({
            name: (input_n?.input as unknown as IInput).name,
            quantity: dispatch?.num_bags,
            warehouse: dispatch?.warehouse,
          })
          await input.save()
        }
        if (rw_input?.quantity) {
          rw_input.quantity = rw_input?.quantity + Number(dispatch?.num_bags)
          await rw_input.save()
        }
      }
    }
    return res
      .status(200)
      .send({error: false, message: "Dispatch updated", data: dispatch})
  } catch (error: any) {
    res.status(400).send({error: true, message: error?.message})
  }
}

// counts

export const countDispatchBagsSent = async (req: Request, res: Response) => {
  const user = await currentUser(req, res)
  const {type} = req.query
  try {
    const disburse =
      type === "Trading"
        ? await dispatchModel.find({
            createdBy: user?.userId,
            type,
          })
        : await dispatchModel.find({
            createdBy: user?.userId,
            isReceived: true,
            type,
          })
    if (!disburse) {
      return res.status(200).send({error: false, message: "not found"})
    }
    const bags = disburse.reduce((total, d) => total + Number(d.num_bags), 0)
    return res.status(200).send({error: false, message: "Success", data: bags})
  } catch (error: any) {
    res.status(400).send({error: true, message: error?.message})
  }
}

export const countDispatchBagsReceive = async (req: Request, res: Response) => {
  const {type} = req.query
  try {
    const userID = await getUserId(req, res)
    const user = await userModel.findById(userID)

    const disburse = await dispatchModel.find({
      warehouse: user?.warehouse,
      isReceived: true,
    })
    if (!disburse) {
      return res.status(200).send({error: false, message: "not found"})
    }
    const bags = disburse.reduce((total, d) => total + Number(d.num_bags), 0)
    return res.status(200).send({error: false, message: "Success", data: bags})
  } catch (error: any) {
    res.status(400).send({error: true, message: error?.message})
  }
}
