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
import mongoose, {Types} from "mongoose"
import {equityModel} from "../models/equity.model"
import {IGrainLRP} from "../types/grainLRP"
import {grainRepaymentModel} from "../models/grain-repayment.model"
import {ICashLRP} from "../types/cashLRP"
import {cashRepaymentModel} from "../models/cash-repayment.model"

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
    })
    if (!farmerCheck) {
      return res.status(400).send({
        error: true,
        message: "error invalid farmer",
      })
    }

    const equityCheck = await equityModel.findOne({
      $and: [{farmer: farmerCheck?._id}, {status: "PAID"}],
    })
    if (!equityCheck) {
      return res.status(400).send({
        error: true,
        message: "No Equity Paid For This Farmer",
      })
    }

    const loanCheck = await disburseModel.find({
      $and: [{farmer: farmerCheck?._id, status: "NOT PAID"}],
    })

    if (loanCheck) {
      const l_hectares = loanCheck.reduce(
        (total, l) => total + Number(l.hectares),
        0
      )
      const h_available = equityCheck.hectares - l_hectares

      if (hectares > h_available) {
        return res.status(400).send({
          error: true,
          message: `Farmer has only ${h_available} hectare remaining`,
        })
      }
      if (h_available <= 0) {
        return res.status(400).send({
          error: true,
          message: "Farmer have a pending loan",
        })
      }
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
        name: {$regex: new RegExp(input.input as string, "i")},
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
    }

    const newDisbursement = await disburseModel.create({
      bundle,
      hectares,
      equity,
      loan_amount,
      repayment_amount,
      outstanding_loan: repayment_amount,
      farmer: farmerCheck && farmerCheck?._id,
      disbursedBy: userID,
      ref_id: await generateRefID(),
      project,
      warehouse: user?.warehouse,
    })

    newDisbursement
      .save()
      .then(
        async (disbursement) => {
          const disburse = await disburseModel
            .findById(disbursement._id)
            .populate("farmer")
            .populate({
              path: "farmer",
              populate: {path: "cooperative"},
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

export const approveDisbursement = async (req: Request, res: Response) => {
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

    const disburse = await disburseModel.findByIdAndUpdate(
      id,
      {isApproved},
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

    const bundleCheck = await bundleModel.findById(disburse?.bundle)
    if (!bundleCheck) {
      disburse.isApproved = false
      await disburse.save()
      return res.status(400).send({
        error: true,
        message: "Invalid Bundle selection",
      })
    }
    if (isApproved === true) {
      for (const input of bundleCheck.inputs) {
        const inputs = await inputModel.findOne({
          name: input.input?.toLowerCase(),
          warehouse: user?.warehouse,
        })
        if (!inputs) {
          disburse.isApproved = false
          await disburse.save()
          return res.send({
            error: true,
            message: `${input.input} is not available in warehouse `,
          })
        }
        if (Number(inputs.quantity) < Number(input.quantity)) {
          disburse.isApproved = false
          await disburse.save()
          return res.send({
            error: true,
            message: `${inputs.quantity} of ${input.input} available in warehouse`,
          })
        }
        inputs.quantity =
          inputs.quantity -
          Number(Number(input.quantity) * Number(disburse?.hectares))
        inputs.quantity_out = inputs.quantity_out
          ? inputs.quantity_out +
            Number(Number(input.quantity) * Number(disburse?.hectares))
          : Number(Number(input.quantity) * Number(disburse?.hectares))
        await inputs.save()
      }
    }
    if (isApproved === false) {
      for (const input of bundleCheck.inputs) {
        const inputs = await inputModel.findOne({
          name: input.input?.toLowerCase(),
          warehouse: user?.warehouse,
        })
        if (!inputs) {
          disburse.isApproved = false
          await disburse.save()
          return res.send({
            error: true,
            message: `${input.input} is not available in warehouse `,
          })
        }

        inputs.quantity =
          inputs.quantity +
          Number(Number(input.quantity) * Number(disburse?.hectares))
        inputs.quantity_out = inputs.quantity_out
          ? inputs.quantity_out -
            Number(Number(input.quantity) * Number(disburse?.hectares))
          : Number(Number(input.quantity) * Number(disburse?.hectares))
        await inputs.save()
      }
    }
    return res
      .status(200)
      .send({error: false, message: "Disbursement updated", data: disburse})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}
// cash repayment
export const cashLRP = async (req: Request, res: Response) => {
  try {
    const user = await userModel.findById(await getUserId(req, res))
    const {disbursement, cash_paid, overage, outstanding_loan}: ICashLRP =
      req.body

    if (!disbursement || !overage || !cash_paid || !outstanding_loan) {
      return res.status(400).send({
        error: true,
        message: "Cash repayment error (some fields are empty / invalid)",
      })
    }

    const disburse = await disburseModel.findOne(
      {_id: new Types.ObjectId(disbursement)},
      {isApproved: true}
    )

    if (!disburse || !disburse.isApproved) {
      return res.status(400).send({
        error: true,
        message: "Loan Not Approved Yet",
      })
    }

    await disburseModel
      .findOneAndUpdate(
        {_id: new Types.ObjectId(disbursement)},
        {
          ...req.body,
          status: outstanding_loan < 1 ? "PAID" : "NOT PAID",
          outstanding_loan: outstanding_loan > 0 ? outstanding_loan : 0,
          overage: overage > 0 ? overage : 0,
          repayedBy: user?._id,
        },
        {
          new: true,
          runValidators: true,
        }
      )
      .then(async (d) => {
        const newCashLRP = await cashRepaymentModel.create({
          ...req.body,
          disbursement: d?._id,
          ref_id: d?.ref_id,
          status: outstanding_loan < 1 ? "PAID" : "PART PAYMENT",
          repayedBy: user?._id,
        })

        if (!newCashLRP) {
          return res.status(400).send({
            error: true,
            message: "Unable to save Cash LRP",
          })
        }
        if (newCashLRP.status === "PAID") {
          await equityModel.findOneAndUpdate(
            {
              $and: [{farmer: d?.farmer}, {status: "PAID"}],
            },
            {status: "USED"},
            {
              new: true,
              runValidators: true,
            }
          )
        }

        return res.status(200).send({
          error: false,
          message: "Loan repayment successful",
          data: newCashLRP,
        })
      })
      .catch((e) => {
        return res.status(400).send({
          error: true,
          message: e.message,
        })
      })
  } catch (error: any) {
    return res.send({error: true, message: error?.message})
  }
}

// grain repayment
export const grainLRP = async (req: Request, res: Response) => {
  try {
    const user = await userModel.findById(await getUserId(req, res))
    const {
      farmer,
      commodities,
      gross_weight,
      net_weight,
      num_bags,
      payable_amount,
      overage,
      outstanding_loan,
      processing_fee,
      logistics_fee,
      equity,
    }: IGrainLRP = req.body

    if (
      !farmer ||
      !num_bags ||
      !gross_weight ||
      !net_weight ||
      !commodities ||
      !payable_amount ||
      !overage ||
      !logistics_fee ||
      !processing_fee ||
      !outstanding_loan ||
      !equity
    ) {
      return res.status(400).send({
        error: true,
        message: "Grains repayment error (some fields are empty / invalid)",
      })
    }

    if (
      farmer === undefined ||
      farmer === "undefined" ||
      farmer === null ||
      farmer === "null"
    ) {
      return res.status(400).send({
        error: true,
        message: "Invalide Farmer (Farmer not from your Warehouse)",
      })
    }
    const disburseCheck = await disburseModel.findOne(
      {farmer: farmer},
      {isApproved: true}
    )

    if (!disburseCheck || !disburseCheck.isApproved) {
      return res.status(400).send({
        error: true,
        message: "Loan Not Approved Yet",
      })
    }

    const disburse = await disburseModel
      .findOneAndUpdate(
        {farmer: farmer, status: "NOT PAID"},
        {
          ...req.body,
          status: outstanding_loan < 1 ? "PAID" : "NOT PAID",
          outstanding_loan: outstanding_loan > 0 ? outstanding_loan : 0,
          overage: overage > 0 ? overage : 0,
          repayedBy: user?._id,
        },
        {
          new: true,
          runValidators: true,
        }
      )
      .then(async (d) => {
        const newGrainLRP = await grainRepaymentModel.create({
          ...req.body,
          disbursement: d?._id,
          ref_id: d?.ref_id,
          status: outstanding_loan < 1 ? "PAID" : "PART PAYMENT",
          repayedBy: user?._id,
          repayment: "Grains",
        })
        if (!newGrainLRP) {
          return res.status(400).send({
            error: true,
            message: "Unable to save grain LRP",
          })
        }
        if (newGrainLRP.status === "PAID") {
          await equityModel.findOneAndUpdate(
            {
              $and: [{farmer: d?.farmer}, {status: "PAID"}],
            },
            {status: "USED"},
            {
              new: true,
              runValidators: true,
            }
          )
        }
        const warehouse = await warehouseModel.findById(user?.warehouse)
        if (!warehouse) {
          return res.status(400).send({
            error: true,
            message: "Invalid user warehouse (can't access properties)",
          })
        }
        if (warehouse) {
          for (const com of commodities!) {
            const index = warehouse?.commodities?.findIndex(
              (comm) =>
                String(comm?.commodity) === String(com.commodity) &&
                String(comm?.grade) === String(com.grade)
            )

            if (index === -1) {
              //push here
              warehouse?.commodities?.push({
                quantity: Number(com.quantity),
                weight: Number(com.gross_weight),
                net_weight: Number(com.net_weight),
                commodity: new mongoose.Types.ObjectId(com.commodity),
                grade: new mongoose.Types.ObjectId(com.grade),
              })
              await warehouse.save()
            } else {
              //update here
              warehouse.commodities[index].quantity += Number(com.quantity)
              warehouse.commodities[index].weight += Number(com.gross_weight)
              warehouse.commodities[index].net_weight += Number(com.net_weight)
              await warehouse.save()
            }
          }
        }
        return res.status(200).send({
          error: false,
          message: "Loan repayment successful",
          data: newGrainLRP,
        })
      })
      .catch((e) => {
        return res.status(400).send({
          error: true,
          message: e.message,
        })
      })
  } catch (error: any) {
    return res.send({error: true, message: error?.message})
  }
}

// export const repaymentDisbursement = async (req: Request, res: Response) => {
//   try {
//     const user = await userModel.findById(await getUserId(req, res))
//     const {
//       farmer,
//       commodities,
//       cash,
//       gross_weight,
//       net_weight,
//       num_bags,
//       payable_amount,
//       overage,
//       outstanding_loan,
//       processing_fee,
//       logistics_fee,
//       repayment_type,
//     }: IDisburse = req.body
//     let farmerID

//     if (repayment_type === "Cash") {
//       if (
//         !farmer ||
//         !cash ||
//         !payable_amount ||
//         !logistics_fee ||
//         !processing_fee ||
//         !overage ||
//         !outstanding_loan
//       ) {
//         return res.status(400).send({
//           error: true,
//           message:
//             "Cash Loan Repayment error (some fields are empty / invalid)",
//         })
//       }
//     } else {
//       if (
//         !farmer ||
//         !num_bags ||
//         !gross_weight ||
//         !net_weight ||
//         !commodities ||
//         !payable_amount ||
//         !overage ||
//         !logistics_fee ||
//         !processing_fee ||
//         !outstanding_loan
//       ) {
//         return res.status(400).send({
//           error: true,
//           message: "Grains repayment error (some fields are empty / invalid)",
//         })
//       }
//     }

//     if (
//       farmer === undefined ||
//       farmer === "undefined" ||
//       farmer === null ||
//       farmer === "null"
//     ) {
//       return res.status(400).send({
//         error: true,
//         message: "Invalide Farmer (Farmer not from your Warehouse)",
//       })
//     }
//     const disburse = await disburseModel.findOneAndUpdate(
//       {farmer: farmer, status: "NOT PAID"},
//       {
//         ...req.body,
//         status: outstanding_loan < 1 ? "PAID" : "NOT PAID",
//         outstanding_loan: outstanding_loan > 0 ? outstanding_loan : 0,
//         overage: overage > 0 ? overage : 0,
//         repayedBy: user?._id,
//       },
//       {
//         new: true,
//         runValidators: true,
//       }
//     )
//     if (!disburse) {
//       return res.status(400).send({
//         error: true,
//         message: "Farmer has no pending loan",
//       })
//     }
//     const warehouse = await warehouseModel.findById(user?.warehouse)

//     if (!warehouse) {
//       return res.status(400).send({
//         error: true,
//         message: "Invalid user warehouse (can't access properties)",
//       })
//     }
//     if (warehouse) {
//       // if (warehouse?.commodities?.length > 0) {
//       //   warehouse?.commodities?.forEach((comm) => {
//       //     commodities?.forEach((com) => {
//       //       if (
//       //         String(comm?.commodity) === String(com.commodity) &&
//       //         String(comm?.grade) === String(com.grade)
//       //       ) {
//       //         console.log("found")
//       //         comm.quantity = comm.quantity + com.quantity
//       //         comm.weight = comm.weight + Number(com.gross_weight)
//       //         comm.net_weight = comm.net_weight + Number(com.net_weight)
//       //         return
//       //       } else {
//       //         warehouse?.commodities?.push({
//       //           quantity: com.quantity,
//       //           weight: Number(com.gross_weight),
//       //           net_weight: Number(com.net_weight),
//       //           commodity: new mongoose.Types.ObjectId(com.commodity),
//       //           grade: new mongoose.Types.ObjectId(com.grade),
//       //         })
//       //         return
//       //       }
//       //     })
//       //   })
//       //   await warehouse.save()
//       // } else {
//       //   console.log("lenght < 0")

//       //   commodities?.map((com) => {
//       //     warehouse?.commodities?.push({
//       //       quantity: com.quantity,
//       //       weight: Number(com.gross_weight),
//       //       net_weight: Number(com.net_weight),
//       //       commodity: new mongoose.Types.ObjectId(com.commodity),
//       //       grade: new mongoose.Types.ObjectId(com.grade),
//       //     })
//       //   })
//       //   await warehouse.save()
//       // }

//       for (const com of commodities!) {
//         const index = warehouse?.commodities?.findIndex(
//           (comm) =>
//             String(comm?.commodity) === String(com.commodity) &&
//             String(comm?.grade) === String(com.grade)
//         )

//         if (index === -1) {
//           //push here
//           warehouse?.commodities?.push({
//             quantity: Number(com.quantity),
//             weight: Number(com.gross_weight),
//             net_weight: Number(com.net_weight),
//             commodity: new mongoose.Types.ObjectId(com.commodity),
//             grade: new mongoose.Types.ObjectId(com.grade),
//           })
//           await warehouse.save()
//         } else {
//           //update here
//           warehouse.commodities[index].quantity += Number(com.quantity)
//           warehouse.commodities[index].weight += Number(com.gross_weight)
//           warehouse.commodities[index].net_weight += Number(com.net_weight)
//           await warehouse.save()
//         }
//       }
//     }
//     const disbursement = await disburseModel
//       .findById(disburse._id)
//       .populate("farmer")
//       .populate({
//         path: "farmer",
//         populate: {path: "cooperative"},
//       })
//       .populate("commodities.commodity")
//       .populate("commodities.grade")
//       .populate("bundle")
//       .populate("disbursedBy")
//       .populate("repayedBy")
//     return res.status(200).send({
//       error: false,
//       message: "Loan repayment successful",
//       data: disbursement,
//     })
//   } catch (error: any) {
//     return res.send({error: true, message: error?.message})
//   }
// }

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
      .populate({
        path: "farmer",
        populate: {path: "cooperative"},
      })
      // .populate("commodities.commodity")
      // .populate("commodities.grade")
      .populate("bundle")
      .populate("disbursedBy")
      .populate("repayedBy")
      .populate("warehouse")
      .populate("project")
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
  const {project} = req.query
  const queries = req.query

  try {
    const userID = await currentUser(req, res)
    const user = await userModel.findById(userID?.userId).populate("warehouse")
    if (user?.role === "WAREHOUSE MANAGER") {
      const disbursement = await disburseModel
        .find({
          disbursedBy: {$in: (user?.warehouse as any)?.supervisors},
        })
        .populate("farmer")
        .populate({
          path: "farmer",
          populate: {path: "cooperative"},
        })
        // .populate("commodities.commodity")
        // .populate("commodities.grade")
        .populate("bundle")
        .populate("disbursedBy")
        .populate("repayedBy")
        .populate("warehouse")
        .populate("project")
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
    if (user?.role === "WAREHOUSE ADMIN") {
      const disbursement = await disburseModel
        .find({disbursedBy: user?._id})
        .populate("farmer")
        .populate({
          path: "farmer",
          populate: {path: "cooperative"},
        })
        // .populate("commodities.commodity")
        // .populate("commodities.grade")
        .populate("bundle")
        .populate("disbursedBy")
        .populate("repayedBy")
        .populate("warehouse")
        .populate("project")
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

    const disbursement = project
      ? await disburseModel
          .find({project})
          .populate("farmer")
          .populate({
            path: "farmer",
            populate: {path: "cooperative"},
          })
          // .populate("commodities.commodity")
          // .populate("commodities.grade")
          .populate("bundle")
          .populate("disbursedBy")
          .populate("repayedBy")
          .populate("warehouse")
          .populate("project")
          .sort({createdAt: -1})
          .limit(Number(queries.limit))
      : await disburseModel
          .find()
          .populate("farmer")
          .populate({
            path: "farmer",
            populate: {path: "cooperative"},
          })
          // .populate("commodities.commodity")
          // .populate("commodities.grade")
          .populate("bundle")
          .populate("disbursedBy")
          .populate("repayedBy")
          .populate("warehouse")
          .populate("project")
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

    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please pass an ID to query",
      })
    }

    const disburse = await disburseModel
      .findByIdAndUpdate(
        id,
        {...req.body},
        {
          new: true,
          runValidators: true,
        }
      )
      .populate("farmer")
      // .populate("commodities.commodity")
      // .populate("commodities.grade")
      .populate("bundle")
      .populate("disbursedBy")
      .populate("repayedBy")
      .populate("warehouse")
      .populate("project")
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
    // const bundleCheck = await bundleModel.findById(disburse?.bundle)
    // if (!bundleCheck) {
    //   return res.status(400).send({
    //     error: true,
    //     message: "Invalid Bundle selection",
    //   })
    // }
    // for (const input of bundleCheck.inputs) {
    //   const inputs = await inputModel.findOne({
    //     name: input.input?.toLowerCase(),
    //     warehouse: disburse?.warehouse,
    //   })
    //   if (!inputs) {
    //     return res.send({
    //       error: true,
    //       message: `${input.input} is not available in warehouse`,
    //     })
    //   }

    //   inputs.quantity =
    //     inputs.quantity +
    //     Number(Number(input.quantity) * Number(disburse?.hectares))
    //   inputs.quantity_out = inputs.quantity_out
    //     ? inputs.quantity_out -
    //       Number(Number(input.quantity) * Number(disburse?.hectares))
    //     : 0
    //   inputs.save()
    // }
    return res
      .status(200)
      .send({error: false, message: "Disbursement Deleted", data: disburse})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

// cash LRP
export const getCashLRP = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please set a search key (ID not found)",
      })
    }

    const disburse = await cashRepaymentModel
      .findById(id)
      .populate(["disbursement", "repayedBy"])
      .populate({
        path: "disbursement",
        populate: ["warehouse", "disbursedBy", "bundle", "farmer", "project"],
      })
      .populate({
        path: "disbursement",
        populate: {path: "farmer", populate: "cooperative"},
      })

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

export const getAllCashLRP = async (req: Request, res: Response) => {
  const {project} = req.query
  const queries = req.query

  try {
    const userID = await currentUser(req, res)
    const user = await userModel.findById(userID?.userId).populate("warehouse")
    if (user?.role === "WAREHOUSE MANAGER") {
      const disbursement = await cashRepaymentModel
        .find({
          disbursedBy: {$in: (user?.warehouse as any)?.supervisors},
        })
        .populate(["disbursement", "repayedBy"])
        .populate({
          path: "disbursement",
          populate: ["warehouse", "disbursedBy", "bundle", "farmer", "project"],
        })
        .populate({
          path: "disbursement",
          populate: {path: "farmer", populate: "cooperative"},
        })
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
    if (user?.role === "WAREHOUSE ADMIN") {
      const disbursement = await cashRepaymentModel
        .find({disbursedBy: user?._id})
        .populate(["disbursement", "repayedBy"])
        .populate({
          path: "disbursement",
          populate: ["warehouse", "disbursedBy", "bundle", "farmer", "project"],
        })
        .populate({
          path: "disbursement",
          populate: {path: "farmer", populate: "cooperative"},
        })
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

    const disbursement = project
      ? await cashRepaymentModel
          .find({project})
          .populate(["disbursement", "repayedBy"])
          .populate({
            path: "disbursement",
            populate: [
              "warehouse",
              "disbursedBy",
              "bundle",
              "farmer",
              "project",
            ],
          })
          .populate({
            path: "disbursement",
            populate: {path: "farmer", populate: "cooperative"},
          })
          .sort({createdAt: -1})
          .limit(Number(queries.limit))
      : await cashRepaymentModel
          .find()
          .populate(["disbursement", "repayedBy"])
          .populate({
            path: "disbursement",
            populate: [
              "warehouse",
              "disbursedBy",
              "bundle",
              "farmer",
              "project",
            ],
          })
          .populate({
            path: "disbursement",
            populate: {path: "farmer", populate: "cooperative"},
          })
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

export const updateCashLRP = async (req: Request, res: Response) => {
  try {
    const {id} = req.params

    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please pass an ID to query",
      })
    }

    const disburse = await cashRepaymentModel
      .findByIdAndUpdate(
        id,
        {...req.body},
        {
          new: true,
          runValidators: true,
        }
      )
      .populate(["disbursement", "repayedBy"])
      .populate({
        path: "disbursement",
        populate: ["warehouse", "disbursedBy", "bundle", "farmer", "project"],
      })
      .populate({
        path: "disbursement",
        populate: {path: "farmer", populate: "cooperative"},
      })
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

export const deleteCashLRP = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    const user_role = await getUserRole(req, res)

    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please pass an ID to query",
      })
    }

    const disburse = await cashRepaymentModel.findByIdAndDelete(id)
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

// cash LRP
export const getGrainLRP = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please set a search key (ID not found)",
      })
    }

    const disburse = await grainRepaymentModel
      .findById(id)
      .populate([
        "disbursement",
        "repayedBy",
        "commodities.commodity",
        "commodities.grade",
      ])
      .populate({
        path: "disbursement",
        populate: ["warehouse", "disbursedBy", "bundle", "farmer", "project"],
      })
      .populate({
        path: "disbursement",
        populate: {path: "farmer", populate: "cooperative"},
      })

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

export const getAllGrainLRP = async (req: Request, res: Response) => {
  const {project} = req.query
  const queries = req.query

  try {
    const userID = await currentUser(req, res)
    const user = await userModel.findById(userID?.userId).populate("warehouse")
    if (user?.role === "WAREHOUSE MANAGER") {
      const disbursement = await grainRepaymentModel
        .find({
          disbursedBy: {$in: (user?.warehouse as any)?.supervisors},
        })
        .populate([
          "disbursement",
          "repayedBy",
          "commodities.commodity",
          "commodities.grade",
        ])
        .populate({
          path: "disbursement",
          populate: ["warehouse", "disbursedBy", "bundle", "farmer", "project"],
        })
        .populate({
          path: "disbursement",
          populate: {path: "farmer", populate: "cooperative"},
        })
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
    if (user?.role === "WAREHOUSE ADMIN") {
      const disbursement = await grainRepaymentModel
        .find({disbursedBy: user?._id})
        .populate([
          "disbursement",
          "repayedBy",
          "commodities.commodity",
          "commodities.grade",
        ])
        .populate({
          path: "disbursement",
          populate: ["warehouse", "disbursedBy", "bundle", "farmer", "project"],
        })
        .populate({
          path: "disbursement",
          populate: {path: "farmer", populate: "cooperative"},
        })
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

    const disbursement = project
      ? await grainRepaymentModel
          .find({project})
          .populate([
            "disbursement",
            "repayedBy",
            "commodities.commodity",
            "commodities.grade",
          ])
          .populate({
            path: "disbursement",
            populate: [
              "warehouse",
              "disbursedBy",
              "bundle",
              "farmer",
              "project",
            ],
          })
          .populate({
            path: "disbursement",
            populate: {path: "farmer", populate: "cooperative"},
          })
          .sort({createdAt: -1})
          .limit(Number(queries.limit))
      : await grainRepaymentModel
          .find()
          .populate([
            "disbursement",
            "repayedBy",
            "commodities.commodity",
            "commodities.grade",
          ])
          .populate({
            path: "disbursement",
            populate: [
              "warehouse",
              "disbursedBy",
              "bundle",
              "farmer",
              "project",
            ],
          })
          .populate({
            path: "disbursement",
            populate: {path: "farmer", populate: "cooperative"},
          })
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

export const updateGrainLRP = async (req: Request, res: Response) => {
  try {
    const {id} = req.params

    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please pass an ID to query",
      })
    }

    const disburse = await grainRepaymentModel
      .findByIdAndUpdate(
        id,
        {...req.body},
        {
          new: true,
          runValidators: true,
        }
      )
      .populate([
        "disbursement",
        "repayedBy",
        "commodities.commodity",
        "commodities.grade",
      ])
      .populate({
        path: "disbursement",
        populate: ["warehouse", "disbursedBy", "bundle", "farmer", "project"],
      })
      .populate({
        path: "disbursement",
        populate: {path: "farmer", populate: "cooperative"},
      })
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

export const deleteGrainLRP = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    const user_role = await getUserRole(req, res)

    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please pass an ID to query",
      })
    }

    const disburse = await grainRepaymentModel.findByIdAndDelete(id)
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
  const userID = await currentUser(req, res)
  const user = await userModel.findById(userID?.userId).populate("warehouse")
  const {project} = req.query
  try {
    if (user?.role === "WAREHOUSE ADMIN") {
      const disburse = project
        ? await disburseModel.find({
            disbursedBy: user?._id,
            project,
          })
        : await disburseModel.find({
            disbursedBy: user?._id,
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
            disbursedBy: {$in: (user?.warehouse as any)?.supervisors},
            project,
          })
        : await disburseModel.find({
            disbursedBy: {$in: (user?.warehouse as any)?.supervisors},
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
  const userID = await currentUser(req, res)
  const user = await userModel.findById(userID?.userId).populate("warehouse")
  const {project} = req.query
  try {
    if (user?.role === "WAREHOUSE ADMIN") {
      const disburse = project
        ? await disburseModel.find({
            disbursedBy: user?._id,
            project,
          })
        : await disburseModel.find({
            disbursedBy: user?._id,
          })

      if (!disburse) {
        return res.status(200).send({error: false, message: "not found"})
      }
      const loan_amount = disburse.reduce(
        (total, d) => total + Number(d.loan_amount),
        0
      )
      const outstanding = disburse.reduce(
        (total, d) => total + Number(d.outstanding_loan),
        0
      )
      const equity = disburse.reduce((total, d) => total + Number(d.equity), 0)
      const amount = loan_amount - equity - outstanding
      return res
        .status(200)
        .send({error: false, message: "Success", data: amount})
    }
    if (user?.role === "WAREHOUSE MANAGER") {
      const disburse = project
        ? await disburseModel.find({
            disbursedBy: {$in: (user?.warehouse as any)?.supervisors},
            project,
          })
        : await disburseModel.find({
            disbursedBy: {$in: (user?.warehouse as any)?.supervisors},
          })
      if (!disburse) {
        return res.status(200).send({error: false, message: "not found"})
      }
      const loan_amount = disburse.reduce(
        (total, d) => total + Number(d.loan_amount),
        0
      )
      const outstanding = disburse.reduce(
        (total, d) => total + Number(d.outstanding_loan),
        0
      )
      const equity = disburse.reduce((total, d) => total + Number(d.equity), 0)
      const amount = loan_amount - equity - outstanding
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
    const loan_amount = disburse.reduce(
      (total, d) => total + Number(d.loan_amount),
      0
    )
    const outstanding = disburse.reduce(
      (total, d) => total + Number(d.outstanding_loan),
      0
    )
    const equity = disburse.reduce((total, d) => total + Number(d.equity), 0)
    const amount = loan_amount - equity - outstanding
    return res
      .status(200)
      .send({error: false, message: "Success", data: amount})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const countOutstandinLoan = async (req: Request, res: Response) => {
  const userID = await currentUser(req, res)
  const user = await userModel.findById(userID?.userId).populate("warehouse")
  const {project} = req.query
  try {
    if (user?.role === "WAREHOUSE ADMIN") {
      const disburse = project
        ? await disburseModel.find({
            disbursedBy: user?._id,
            status: "NOT PAID" || "PART PAYMENT",
            project,
          })
        : await disburseModel.find({
            disbursedBy: user?._id,
            status: "NOT PAID" || "PART PAYMENT",
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
            disbursedBy: {$in: (user?.warehouse as any)?.supervisors},
            status: "NOT PAID" || "PART PAYMENT",
            project,
          })
        : await disburseModel.find({
            disbursedBy: {$in: (user?.warehouse as any)?.supervisors},
            status: "NOT PAID" || "PART PAYMENT",
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
  const userID = await currentUser(req, res)
  const user = await userModel.findById(userID?.userId).populate("warehouse")
  const {project} = req.query
  try {
    if (user?.role === "WAREHOUSE ADMIN") {
      const disburse = project
        ? await disburseModel.find({disbursedBy: user?._id, project})
        : await disburseModel.find({disbursedBy: user?._id})

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
        ? await disburseModel.find({
            disbursedBy: {$in: (user?.warehouse as any)?.supervisors},
            project,
          })
        : await disburseModel.find({
            disbursedBy: {$in: (user?.warehouse as any)?.supervisors},
          })
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

export const countRecoveredGrossWeight = async (
  req: Request,
  res: Response
) => {
  const userID = await currentUser(req, res)
  const user = await userModel.findById(userID?.userId).populate("warehouse")
  const {project} = req.query
  try {
    if (user?.role === "WAREHOUSE MANAGER") {
      const disburse = project
        ? await grainRepaymentModel.find({
            repayedBy: user?._id,
            status: "PAID" || "PART PAYMENT",
            project,
          })
        : await grainRepaymentModel.find({
            repayedBy: user?._id,
            status: "PAID" || "PART PAYMENT",
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
      ? await grainRepaymentModel.find({
          status: "PAID" || "PART PAYMENT",
          project,
        })
      : await grainRepaymentModel.find({status: "PAID" || "PART PAYMENT"})

    if (!disburse) {
      return res.status(200).send({error: false, message: "not found"})
    }
    const netweight = disburse.reduce(
      (total, d) => total + Number(d.gross_weight),
      0
    )
    return res
      .status(200)
      .send({error: false, message: "Success", data: netweight})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const countRecoveredNetWeight = async (req: Request, res: Response) => {
  const userID = await currentUser(req, res)
  const user = await userModel.findById(userID?.userId).populate("warehouse")
  const {project} = req.query
  try {
    if (user?.role === "WAREHOUSE MANAGER") {
      const disburse = project
        ? await grainRepaymentModel.find({
            repayedBy: user?._id,
            status: "PAID" || "PART PAYMENT",
            project,
          })
        : await grainRepaymentModel.find({
            repayedBy: user?._id,
            status: "PAID" || "PART PAYMENT",
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
      ? await grainRepaymentModel.find({
          status: "PAID" || "PART PAYMENT",
          project,
        })
      : await grainRepaymentModel.find({status: "PAID" || "PART PAYMENT"})

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

export const countRecoveredCash = async (req: Request, res: Response) => {
  const userID = await currentUser(req, res)
  const user = await userModel.findById(userID?.userId).populate("warehouse")
  const {project} = req.query
  try {
    if (user?.role === "WAREHOUSE MANAGER") {
      const disburse = project
        ? await cashRepaymentModel.find({
            repayedBy: user?._id,
            status: "PAID" || "PART PAYMENT",
            project,
          })
        : await cashRepaymentModel.find({
            repayedBy: user?._id,
            status: "PAID" || "PART PAYMENT",
          })

      if (!disburse) {
        return res.status(200).send({error: false, message: "not found"})
      }
      const cash = disburse.reduce((total, d) => total + Number(d.cash_paid), 0)
      return res
        .status(200)
        .send({error: false, message: "Success", data: cash})
    }

    const disburse = project
      ? await cashRepaymentModel.find({
          status: "PAID" || "PART PAYMENT",
          project,
        })
      : await cashRepaymentModel.find({status: "PAID" || "PART PAYMENT"})

    if (!disburse) {
      return res.status(200).send({error: false, message: "not found"})
    }
    const cash = disburse.reduce((total, d) => total + Number(d.cash_paid), 0)
    return res.status(200).send({error: false, message: "Success", data: cash})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const countEquity = async (req: Request, res: Response) => {
  const userID = await currentUser(req, res)
  const user = await userModel.findById(userID?.userId).populate("warehouse")
  const {project} = req.query
  try {
    if (user?.role === "WAREHOUSE ADMIN") {
      const disburse = project
        ? await disburseModel.find({
            disbursedBy: user?._id,
            project,
          })
        : await disburseModel.find({
            disbursedBy: user?._id,
          })

      if (!disburse) {
        return res.status(200).send({error: false, message: "not found"})
      }
      const netweight = disburse.reduce(
        (total, d) => total + Number(d.equity),
        0
      )

      return res
        .status(200)
        .send({error: false, message: "Success", data: netweight})
    }
    if (user?.role === "WAREHOUSE MANAGER") {
      const disburse = project
        ? await disburseModel.find({
            disbursedBy: {$in: (user?.warehouse as any)?.supervisors},
            project,
          })
        : await disburseModel.find({
            disbursedBy: {$in: (user?.warehouse as any)?.supervisors},
          })
      if (!disburse) {
        return res.status(200).send({error: false, message: "not found"})
      }
      const netweight = disburse.reduce(
        (total, d) => total + Number(d.equity),
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
    const netweight = disburse.reduce((total, d) => total + Number(d.equity), 0)
    return res
      .status(200)
      .send({error: false, message: "Success", data: netweight})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}
