import {Request, Response} from "express"
import {
  farmerModel,
  disburseModel,
  bundleModel,
  inputModel,
  userModel,
  warehouseModel,
} from "../models"
import {IDisburse} from "../types/disburse"
import {
  currentUser,
  generateRefID,
  getCurrentProject,
  getUserRole,
} from "../utils"
import {getUserId} from "../utils/index"
import mongoose from "mongoose"

export const loanDisbursement = async (req: Request, res: Response) => {
  try {
    const project = await getCurrentProject()
    const userID = await getUserId(req, res)
    const user = await userModel.findById(userID)
    if (!project) {
      return res.status(400).send({
        error: true,
        message: "Season ends (No ongoing programme)",
      })
    }
    const {
      farmer,
      bundle,
      hectares,
      equity,
      loan_amount,
      repayment_amount,
    }: IDisburse = req.body

    if (
      !farmer ||
      !hectares ||
      !equity ||
      !bundle ||
      !loan_amount ||
      !repayment_amount
    ) {
      return res.status(400).send({
        error: true,
        message: "disbursement error (some fields are empty / invalid)",
      })
    }

    const farmerCheck = await farmerModel.findOne({
      farmer_id: farmer,
      supervisor: userID,
    })
    if (!farmerCheck) {
      return res.status(400).send({
        error: true,
        message: "error invalid farmer",
      })
    }
    const loanCheck = await disburseModel.findOne({
      $and: [{farmer: farmerCheck?._id}, {status: "NOT PAID"}],
    })
    if (loanCheck) {
      return res.status(400).send({
        error: true,
        message: "Farmer have a pending loan",
      })
    }

    const bundleCheck = await bundleModel.findById(bundle)
    if (!bundleCheck) {
      return res.status(400).send({
        error: true,
        message: "Invalid Bundle selection",
      })
    }
    for (const input of bundleCheck.inputs) {
      const inputs = await inputModel.findOne({
        name: input.input?.toLowerCase(),
        warehouse: user?.warehouse,
      })
      if (!inputs) {
        return res.send({
          error: true,
          message: `${input.input} is not available in warehouse`,
        })
      }
      if (Number(inputs.quantity) < Number(input.quantity)) {
        return res.send({
          error: true,
          message: `${inputs.quantity} of ${input.input} available in stock`,
        })
      }
      inputs.quantity = inputs.quantity - Number(input.quantity)
      inputs.quantity_out = inputs.quantity_out
        ? inputs.quantity_out + Number(input.quantity)
        : Number(input.quantity)
      inputs.save()
    }

    const newDisbursement = await disburseModel.create({
      bundle,
      hectares,
      equity,
      loan_amount,
      repayment_amount,
      farmer: farmerCheck && farmerCheck?._id,
      disbursedBy: userID,
      ref_id: await generateRefID(),
      project,
    })

    newDisbursement
      .save()
      .then(
        async (disbursement) => {
          const disburse = await disburseModel
            .findById(disbursement._id)
            .populate("farmer")
            .populate("commodities.commodity")
            .populate({
              path: "commodities.commodity",
              populate: {path: "grade"},
            })
            .populate("bundle")
            .populate("disbursedBy")
          return res.status(201).send({
            error: false,
            message: "disburse created successfully",
            data: disburse,
          })
        },
        (err) => {
          return res.send({error: true, message: err?.message})
        }
      )
      .catch((err) => {
        console.log(err)

        return res.send({error: true, message: err?.message})
      })
  } catch (error: any) {
    return res.send({error: true, message: error?.message})
  }
}

export const repaymentDisbursement = async (req: Request, res: Response) => {
  try {
    const user = await userModel.findById(await getUserId(req, res))
    const {
      farmer,
      commodities,
      cash,
      gross_weight,
      net_weight,
      num_bags,
      payable_amount,
      overage,
      outstanding_loan,
      processing_fee,
      logistics_fee,
    }: IDisburse = req.body
    let farmerID

    if (
      !farmer ||
      !num_bags ||
      !gross_weight ||
      !net_weight ||
      (!commodities && !cash) ||
      !payable_amount ||
      !overage ||
      !logistics_fee ||
      !processing_fee ||
      !outstanding_loan
    ) {
      return res.status(400).send({
        error: true,
        message: "disbursement error (some fields are empty / invalid)",
      })
    }

    const disburse = await disburseModel.findOneAndUpdate(
      {farmer: farmer, status: "NOT PAID"},
      {
        ...req.body,
        status: outstanding_loan < 1 ? "PAID" : "NOT PAID",
        repayment_amount: outstanding_loan,
        repayedBy: user?._id,
      },
      {
        new: true,
        runValidators: true,
      }
    )
    if (!disburse) {
      return res.status(400).send({
        error: true,
        message: "Farmer has no pending loan",
      })
    }
    const warehouse = await warehouseModel.findById(user?.warehouse)

    if (warehouse) {
      const updateCommodities = new Promise(async (resolve, rejects) => {
        warehouse?.commodities?.forEach((comm) => {
          return commodities?.map((com) => {
            if (
              comm?.commodity === new mongoose.Types.ObjectId(com.commodity)
            ) {
              comm.quantity = comm.quantity + com.quantity
              comm.weight = comm.weight + Number(com.gross_weight)
              return comm
            } else {
              return {
                commodity: new mongoose.Types.ObjectId(com.commodity),
                quantity: com.quantity,
                weight: com.gross_weight,
              }
            }
          })
        })
        const saved = await warehouse.save()
        resolve(saved)
      })
    }
    const disbursement = await disburseModel
      .findById(disburse._id)
      .populate("farmer")
      .populate("commodities.commodity")
      .populate({
        path: "commodities.commodity",
        populate: {path: "grade"},
      })
      .populate("bundle")
      .populate("disbursedBy")
      .populate("repayedBy")
    return res.status(200).send({
      error: false,
      message: "Loan repayment successful",
      data: disbursement,
    })
  } catch (error: any) {
    return res.send({error: true, message: error?.message})
  }
}

export const getDisbursement = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please set a search key (ID not found)",
      })
    }

    const disburse = await disburseModel
      .findById(id)
      .populate("farmer")
      .populate("commodities.commodity")
      .populate({path: "commodities.commodity", populate: {path: "grade"}})
      .populate("bundle")
    if (!disburse) {
      return res.status(404).send({
        error: true,
        message: "Disbursement not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "Success", data: disburse})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const getAllDisbursements = async (req: Request, res: Response) => {
  const user = await currentUser(req, res)
  const queries = req.query
  try {
    if (user?.role === "SUPERVISOR") {
      const disbursement = await disburseModel
        .find({disbursedBy: user?.userId})
        .populate("farmer")
        .populate("commodities.commodity")
        .populate({path: "commodities.commodity", populate: {path: "grade"}})
        .populate("bundle")
        .populate("disbursedBy")
        .populate("repayedBy")
        .sort({createdAt: -1})
        .limit(Number(queries.limit))
      if (!disbursement) {
        return res.status(404).send({
          error: true,
          message: "Disbursementment not found",
        })
      }
      return res
        .status(200)
        .send({error: false, message: "Success", data: disbursement})
    }
    if (user?.role === "WAREHOUE MANAGER") {
      const disbursement = await disburseModel
        .find({repayedBy: user?.userId})
        .populate("farmer")
        .populate("commodities.commodity")
        .populate({path: "commodities.commodity", populate: {path: "grade"}})
        .populate("bundle")
        .populate("disbursedBy")
        .populate("repayedBy")
        .sort({createdAt: -1})
        .limit(Number(queries.limit))
      if (!disbursement) {
        return res.status(404).send({
          error: true,
          message: "Disbursementment not found",
        })
      }
      return res
        .status(200)
        .send({error: false, message: "Success", data: disbursement})
    }
    const disbursement = await disburseModel
      .find()
      .populate("farmer")
      .populate("commodities.commodity")
      .populate({path: "commodities.commodity", populate: {path: "grade"}})
      .populate("bundle")
      .populate("disbursedBy")
      .populate("repayedBy")
      .sort({createdAt: -1})
      .limit(Number(queries.limit))
    if (!disbursement) {
      return res.status(404).send({
        error: true,
        message: "Disbursementment not found",
      })
    }
    return res
      .status(200)
      .send({error: false, message: "Success", data: disbursement})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const updateDisbursement = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    const {farmer} = req.body
    let farmerID

    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please pass an ID to query",
      })
    }

    if (farmer) {
      const farmerCheck = await farmerModel.findOne({
        farmer_id: req.body.farmer,
      })
      if (!farmerCheck) {
        return res.status(400).send({
          error: true,
          message: "error invalid farmer",
        })
      }
      farmerID = farmerCheck._id
    }
    const disburse = await disburseModel.findByIdAndUpdate(
      id,
      {...req.body, farmer: farmer && farmerID},
      {
        new: true,
        runValidators: true,
      }
    )
    if (!disburse) {
      return res.status(404).send({
        error: true,
        message: "Disbursement not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "Disbursement updated", data: disburse})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const deleteDisbursement = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    const user_role = await getUserRole(req, res)

    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please pass an ID to query",
      })
    }

    const disburse = await disburseModel.findByIdAndDelete(id)
    if (!disburse) {
      return res.status(404).send({
        error: true,
        message: "Disbursement not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "Disbursement Deleted", data: disburse})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

// counts

export const countLoanDisburse = async (req: Request, res: Response) => {
  const user = await currentUser(req, res)
  const {project} = req.query
  try {
    if (user?.role === "SUPERVISOR") {
      const disburse = project
        ? await disburseModel.find({
            disbursedBy: user?.userId,
            project,
          })
        : await disburseModel.find({
            disbursedBy: user?.userId,
          })

      if (!disburse) {
        return res.status(200).send({error: false, message: "not found"})
      }
      const amount = disburse.reduce(
        (total, d) => total + Number(d.loan_amount),
        0
      )
      return res
        .status(200)
        .send({error: false, message: "Success", data: amount})
    }
    if (user?.role === "WAREHOUSE MANAGER") {
      const disburse = project
        ? await disburseModel.find({
            repayedBy: user?.userId,
            project,
          })
        : await disburseModel.find({
            repayedBy: user?.userId,
          })

      if (!disburse) {
        return res.status(200).send({error: false, message: "not found"})
      }
      const amount = disburse.reduce(
        (total, d) => total + Number(d.loan_amount),
        0
      )
      return res
        .status(200)
        .send({error: false, message: "Success", data: amount})
    }
    const disburse = project
      ? await disburseModel.find({project})
      : await disburseModel.find()

    if (!disburse) {
      return res.status(200).send({error: false, message: "not found"})
    }
    const amount = disburse.reduce(
      (total, d) => total + Number(d.loan_amount),
      0
    )
    return res
      .status(200)
      .send({error: false, message: "Success", data: amount})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const countRecoveredLoan = async (req: Request, res: Response) => {
  const user = await currentUser(req, res)
  const {project} = req.query
  try {
    if (user?.role === "SUPERVISOR") {
      const disburse = project
        ? await disburseModel.find({
            disbursedBy: user?.userId,
            status: "PAID",
            project,
          })
        : await disburseModel.find({
            disbursedBy: user?.userId,
            status: "PAID",
          })

      if (!disburse) {
        return res.status(200).send({error: false, message: "not found"})
      }
      const amount = disburse.reduce(
        (total, d) => total + Number(d.repayment_amount),
        0
      )
      return res
        .status(200)
        .send({error: false, message: "Success", data: amount})
    }
    if (user?.role === "WAREHOUSE MANAGER") {
      const disburse = project
        ? await disburseModel.find({
            repayedBy: user?.userId,
            status: "PAID",
            project,
          })
        : await disburseModel.find({
            repayedBy: user?.userId,
            status: "PAID",
          })
      if (!disburse) {
        return res.status(200).send({error: false, message: "not found"})
      }
      const amount = disburse.reduce(
        (total, d) => total + Number(d.repayment_amount),
        0
      )
      return res
        .status(200)
        .send({error: false, message: "Success", data: amount})
    }
    const disburse = await disburseModel.find()

    if (!disburse) {
      return res.status(200).send({error: false, message: "not found"})
    }
    const repayment = disburse.reduce(
      (total, d) => total + Number(d.repayment_amount),
      0
    )
    return res
      .status(200)
      .send({error: false, message: "Success", data: repayment})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const countOutstandinLoan = async (req: Request, res: Response) => {
  const user = await currentUser(req, res)
  const {project} = req.query
  try {
    if (user?.role === "SUPERVISOR") {
      const disburse = project
        ? await disburseModel.find({
            disbursedBy: user?.userId,
            status: "NOT PAID",
            project,
          })
        : await disburseModel.find({
            disbursedBy: user?.userId,
            status: "NOT PAID",
          })

      if (!disburse) {
        return res.status(200).send({error: false, message: "not found"})
      }
      const amount = disburse.reduce(
        (total, d) => total + Number(d.outstanding_loan),
        0
      )
      return res
        .status(200)
        .send({error: false, message: "Success", data: amount})
    }
    if (user?.role === "WAREHOUSE MANAGER") {
      const disburse = project
        ? await disburseModel.find({
            repayedBy: user?.userId,
            status: "NOT PAID",
            project,
          })
        : await disburseModel.find({
            repayedBy: user?.userId,
            status: "NOT PAID",
          })

      if (!disburse) {
        return res.status(200).send({error: false, message: "not found"})
      }
      const amount = disburse.reduce(
        (total, d) => total + Number(d.outstanding_loan),
        0
      )
      return res
        .status(200)
        .send({error: false, message: "Success", data: amount})
    }
    const disburse = project
      ? await disburseModel.find({project})
      : await disburseModel.find()

    if (!disburse) {
      return res.status(200).send({error: false, message: "not found"})
    }
    const outstanding = disburse.reduce(
      (total, d) => total + Number(d.outstanding_loan),
      0
    )
    return res
      .status(200)
      .send({error: false, message: "Success", data: outstanding})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const countDisburseHectares = async (req: Request, res: Response) => {
  const user = await currentUser(req, res)
  const {project} = req.query
  try {
    if (user?.role === "SUPERVISOR") {
      const disburse = project
        ? await disburseModel.find({disbursedBy: user?.userId, project})
        : await disburseModel.find({disbursedBy: user?.userId})

      if (!disburse) {
        return res.status(200).send({error: false, message: "not found"})
      }
      const hectares = disburse.reduce(
        (total, d) => total + Number(d.hectares),
        0
      )
      return res
        .status(200)
        .send({error: false, message: "Success", data: hectares})
    }
    if (user?.role === "WAREHOUSE MANAGER") {
      const disburse = project
        ? await disburseModel.find({repayedBy: user?.userId, project})
        : await disburseModel.find({repayedBy: user?.userId})
      if (!disburse) {
        return res.status(200).send({error: false, message: "not found"})
      }
      const hectares = disburse.reduce(
        (total, d) => total + Number(d.hectares),
        0
      )
      return res
        .status(200)
        .send({error: false, message: "Success", data: hectares})
    }
    const disburse = project
      ? await disburseModel.find({project})
      : await disburseModel.find()

    if (!disburse) {
      return res.status(200).send({error: false, message: "not found"})
    }
    const hectares = disburse.reduce(
      (total, d) => total + Number(d.hectares),
      0
    )
    return res
      .status(200)
      .send({error: false, message: "Success", data: hectares})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const countRecoveredNetWeight = async (req: Request, res: Response) => {
  const user = await currentUser(req, res)
  const {project} = req.query
  try {
    if (user?.role === "SUPERVISOR") {
      const disburse = project
        ? await disburseModel.find({
            disbursedBy: user?.userId,
            status: "PAID",
            project,
          })
        : await disburseModel.find({
            disbursedBy: user?.userId,
            status: "PAID",
          })

      if (!disburse) {
        return res.status(200).send({error: false, message: "not found"})
      }
      const netweight = disburse.reduce(
        (total, d) => total + Number(d.net_weight),
        0
      )
      return res
        .status(200)
        .send({error: false, message: "Success", data: netweight})
    }
    if (user?.role === "WAREHOUSE MANAGER") {
      const disburse = project
        ? await disburseModel.find({
            repayedBy: user?.userId,
            status: "PAID",
            project,
          })
        : await disburseModel.find({
            repayedBy: user?.userId,
            status: "PAID",
          })
      if (!disburse) {
        return res.status(200).send({error: false, message: "not found"})
      }
      const netweight = disburse.reduce(
        (total, d) => total + Number(d.net_weight),
        0
      )
      return res
        .status(200)
        .send({error: false, message: "Success", data: netweight})
    }
    const disburse = project
      ? await disburseModel.find({project})
      : await disburseModel.find()

    if (!disburse) {
      return res.status(200).send({error: false, message: "not found"})
    }
    const netweight = disburse.reduce(
      (total, d) => total + Number(d.net_weight),
      0
    )
    return res
      .status(200)
      .send({error: false, message: "Success", data: netweight})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}
