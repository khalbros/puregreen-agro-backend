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
    commodities: [
      {
        commodity: {
          type: Schema.Types.ObjectId,
          ref: "Commodity",
        },
        quantity: Number,
        gross_weight: {
          type: Number,
        },
        net_weight: {
          type: Number,
        },
      },
    ],
    cash: {type: Number},
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
    payable_amount: {
      type: Number,
    },
    outstanding_loan: {
      type: Number,
    },
    overage: {
      type: Number,
    },
    gross_weight: {
      type: Number,
    },
    net_weight: {
      type: Number,
    },
    num_bags: {
      type: Number,
    },
    logistics_fee: {
      type: Number,
    },
    processing_fee: {
      type: Number,
    },
    status: {
      type: String,
      default: "NOT PAID",
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },
    disbursedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    repayedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {timestamps: true}
)

export const disburseModel = model("Disburse", disburseSchema)
