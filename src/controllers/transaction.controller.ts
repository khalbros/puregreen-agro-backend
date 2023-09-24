import {Request, Response} from "express"
import {clientModel, transactionModel, warehouseModel} from "../models"
import {ITransaction} from "../types/transaction"
import {currentUser, getUserId, getUserRole} from "../utils"

export const createTransaction = async (req: Request, res: Response) => {
  try {
    const {
      type,
      commodity,
      client,
      gross_weight,
      net_weight,
      duration,
      truck_number,
      num_bags,
      driver,
      amount,
    }: ITransaction = req.body

    if (
      !type ||
      !client ||
      !num_bags ||
      !gross_weight ||
      !commodity ||
      !net_weight ||
      !driver ||
      !truck_number ||
      !amount
    ) {
      return res.status(400).send({
        error: true,
        message: "transactions error (some fields are empty / invalid)",
      })
    }

    if (type === "Storage" && !duration) {
      return res.status(400).send({
        error: true,
        message: "transactions error (duration field empty)",
      })
    }
    const clientCheck = await clientModel.findOne({client_id: client})
    if (!clientCheck) {
      return res.status(400).send({
        error: true,
        message: "error invalid client",
      })
    }
    const newTransaction = await transactionModel.create({
      ...req.body,
      client: clientCheck && clientCheck?._id,
      createdBy: await getUserId(req, res),
    })

    newTransaction
      .save()
      .then(
        async (data) => {
          const warehouse = await warehouseModel.findOne({
            warehouse_manager: data.createdBy,
          })

          if (!warehouse) {
            return res.send({
              error: true,
              message: "Warehouse not found",
            })
          }

          const comm = warehouse?.commodities.find((commodity) => {
            return String(commodity.commodity) === String(data.commodity)
          })
          if (comm) {
            warehouse.commodities = warehouse?.commodities.map((commodity) => {
              console.log("called")
              if (String(commodity.commodity) === String(data.commodity)) {
                commodity.quantity =
                  Number(commodity.quantity) + Number(data.num_bags)
                commodity.weight =
                  Number(commodity.weight) + Number(data.gross_weight)
                return commodity
              } else {
                return commodity
              }
            }) as never
            await warehouse.save()
          } else {
            warehouse.commodities.push({
              commodity: data.commodity,
              quantity: Number(data.num_bags),
              weight: Number(data.gross_weight),
            })
            await warehouse.save()
          }
          return res.status(201).send({
            error: false,
            message: "transaction created successfully",
            data,
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

export const getTransaction = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please set a search key (ID not found)",
      })
    }

    const transaction = await transactionModel
      .findById(id)
      .sort({createdAt: -1})
      .populate("client")
      .populate("commodity")
      .populate("commodity.grade")
      .populate("createdBy", {name: true})
    if (!transaction) {
      return res.status(404).send({
        error: true,
        message: "Transaction not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "Success", data: transaction})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const getAllTransactions = async (req: Request, res: Response) => {
  try {
    const user = await currentUser(req, res)
    const {type} = req.query
    if (type != "" && type) {
      if (user?.role === "WAREHOUSE MANAGER") {
        const transactions = await transactionModel
          .find({createdBy: user.userId, type})
          .sort({createdAt: -1})
          .populate("client")
          .populate("commodity")
          .populate({path: "commodity", populate: {path: "grade"}})
          .populate("createdBy", {name: true})
        if (!transactions) {
          return res.status(404).send({
            error: true,
            message: "Commodity not found",
          })
        }
        return res
          .status(200)
          .send({error: false, message: "Success", data: transactions})
      }
      const transactions = await transactionModel
        .find({type})
        .sort({createdAt: -1})
        .populate("client")
        .populate("commodity")
        .populate({path: "commodity", populate: {path: "grade"}})
        .populate("createdBy", {name: true})
      if (!transactions) {
        return res.status(404).send({
          error: true,
          message: "Commodity not found",
        })
      }
      return res
        .status(200)
        .send({error: false, message: "Success", data: transactions})
    }

    if (user?.role === "WAREHOUSE MANAGER") {
      const transactions = await transactionModel
        .find({createdBy: user.userId})
        .sort({createdAt: -1})
        .populate("client")
        .populate("commodity")
        .populate({path: "commodity", populate: {path: "grade"}})
        .populate("createdBy", {name: true})
      if (!transactions) {
        return res.status(404).send({
          error: true,
          message: "Commodity not found",
        })
      }
      return res
        .status(200)
        .send({error: false, message: "Success", data: transactions})
    }
    const transactions = await transactionModel
      .find()
      .sort({createdAt: -1})
      .populate("client")
      .populate("commodity")
      .populate({path: "commodity", populate: {path: "grade"}})
      .populate("createdBy", {name: true})
    if (!transactions) {
      return res.status(404).send({
        error: true,
        message: "Transaction not found",
      })
    }
    return res
      .status(200)
      .send({error: false, message: "Success", data: transactions})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const updateTransaction = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    const {client} = req.body
    let clientID

    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please pass an ID to query",
      })
    }

    if (client) {
      const clientCheck = await clientModel.findOne({
        client_id: req.body.client,
      })
      if (!clientCheck) {
        return res.status(400).send({
          error: true,
          message: "error invalid client",
        })
      }
      clientID = clientCheck._id
    }
    const transaction = await transactionModel.findByIdAndUpdate(
      id,
      {...req.body, client: client && clientID},
      {
        new: true,
        runValidators: true,
      }
    )
    if (!transaction) {
      return res.status(404).send({
        error: true,
        message: "Transaction not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "Transaction updated", data: transaction})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    const user_role = await getUserRole(req, res)

    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please pass an ID to query",
      })
    }

    const transaction = await transactionModel.findByIdAndDelete(id)
    if (!transaction) {
      return res.status(404).send({
        error: true,
        message: "Transaction not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "Transaction Deleted", data: transaction})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}
