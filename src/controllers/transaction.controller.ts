import {Request, Response} from "express"
import {
  clientModel,
  transactionModel,
  userModel,
  warehouseModel,
} from "../models"
import {ITransaction} from "../types/transaction"
import {currentUser, getUserId, getUserRole} from "../utils"

export const createTransaction = async (req: Request, res: Response) => {
  try {
    const {
      type,
      commodity,
      grade,
      client,
      gross_weight,
      net_weight,
      duration,
      truck_number,
      num_bags,
      driver,
      amount,
      logistics_fee,
      handling_fee,
      admin_fee,
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
      !amount ||
      !handling_fee ||
      !grade
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
          return res.status(200).send({
            error: false,
            message: "transaction raised",
            data: data,
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
          .populate("grade")
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
        .populate("grade")
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
        .populate("grade")
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
      .populate("grade")
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

export const approveTransaction = async (req: Request, res: Response) => {
  try {
    const userID = await getUserId(req, res)
    const user = await userModel.findById(userID)
    const {id} = req.params
    const {isApproved} = req.body

    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please pass an ID to query",
      })
    }

    const transac = await transactionModel.findByIdAndUpdate(
      id,
      {isApproved},
      {
        new: true,
        runValidators: true,
      }
    )
    if (!transac) {
      return res.status(404).send({
        error: true,
        message: "Disbursement not found",
      })
    }
    const warehouse = await warehouseModel.findOne({
      warehouse_manager: transac.createdBy,
    })

    if (!warehouse) {
      return res.send({
        error: true,
        message: "Warehouse not found",
      })
    }

    const comm = warehouse?.commodities.find((commodity) => {
      return (
        String(commodity.commodity) === String(transac.commodity) &&
        String(commodity.grade) === String(transac.grade)
      )
    })
    if (comm) {
      warehouse.commodities = warehouse?.commodities.map((commodity) => {
        if (
          String(commodity.commodity) === String(transac.commodity) &&
          String(commodity.grade) === String(transac.grade)
        ) {
          commodity.quantity =
            Number(commodity.quantity) + Number(transac.num_bags)
          commodity.weight =
            Number(commodity.weight) + Number(transac.gross_weight)
          commodity.net_weight =
            Number(commodity.net_weight) + Number(transac.net_weight)
          commodity.grade = transac.grade
          return commodity
        } else {
          return commodity
        }
      }) as never
      await warehouse.save()
    } else {
      warehouse.commodities.push({
        commodity: transac.commodity,
        quantity: Number(transac.num_bags),
        weight: Number(transac.gross_weight),
        net_weight: Number(transac.net_weight),
        grade: transac.grade,
      })
      await warehouse.save()
    }

    return res
      .status(200)
      .send({error: false, message: "transaction approved", data: transac})
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

    const transac = await transactionModel.findByIdAndDelete(id)
    if (!transac) {
      return res.status(404).send({
        error: true,
        message: "Transaction not found",
      })
    }

    // const warehouse = await warehouseModel.findOne({
    //   warehouse_manager: transac.createdBy,
    // })

    // if (!warehouse) {
    //   return res.send({
    //     error: true,
    //     message: "Warehouse not found",
    //   })
    // }

    // const comm = warehouse?.commodities.find((commodity) => {
    //   return (
    //     String(commodity.commodity) === String(transac.commodity) &&
    //     String(commodity.grade) === String(transac.grade)
    //   )
    // })
    // if (comm) {
    //   warehouse.commodities = warehouse?.commodities.map((commodity) => {
    //     if (
    //       String(commodity.commodity) === String(transac.commodity) &&
    //       String(commodity.grade) === String(transac.grade)
    //     ) {
    //       commodity.quantity =
    //         Number(commodity.quantity) - Number(transac.num_bags)
    //       commodity.weight =
    //         Number(commodity.weight) - Number(transac.gross_weight)
    //       commodity.net_weight =
    //         Number(commodity.net_weight) - Number(transac.net_weight)
    //       commodity.grade = transac.grade
    //       return commodity
    //     } else {
    //       return commodity
    //     }
    //   }) as never
    //   await warehouse.save()
    // } else {
    //   return res.send({
    //     error: true,
    //     message: "Commodity not found",
    //   })
    // }

    return res
      .status(200)
      .send({error: false, message: "Transaction Deleted", data: transac})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}
