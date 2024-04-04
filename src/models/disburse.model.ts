import {Schema, model} from "mongoose"

const disburseSchema = new Schema(
  {
    farmer: {
      type: Schema.Types.ObjectId,
      ref: "Farmer",
    },
    ref_id: {type: String},
    hectares: {
      type: Number,
      required: true,
    },
    bundle: {
      type: Schema.Types.ObjectId,
      ref: "Bundle",
    },

    repayment_type: {type: String},
    equity: {
      type: Number,
      required: true,
    },
    loan_amount: {
      type: Number,
      required: true,
    },
    repayment_amount: {
      type: Number,
    },

    outstanding_loan: {
      type: Number,
    },
    overage: {
      type: Number,
    },

    status: {
      type: String,
      default: "NOT PAID",
    },
    isApproved: {type: Boolean, default: false},
    isEquityPaid: {type: Boolean, default: false},
    warehouse: {
      type: Schema.Types.ObjectId,
      ref: "Warehouse",
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },
    disbursedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {timestamps: true}
)

export const disburseModel = model("Disburse", disburseSchema)
