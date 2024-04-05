import {Schema, model} from "mongoose"

const cashRepaymentSchema = new Schema(
  {
    disbursement: {
      type: Schema.Types.ObjectId,
      ref: "Disburse",
    },
    ref_id: {type: String},
    cash_paid: {type: Number},
    logistics_fee: {
      type: Number,
    },
    processing_fee: {
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

    repayedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {timestamps: true}
)

export const cashRepaymentModel = model("Cash_payment", cashRepaymentSchema)
