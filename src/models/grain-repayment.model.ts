import {Schema, model} from "mongoose"

const grainRepaymentSchema = new Schema(
  {
    disbursement: {
      type: Schema.Types.ObjectId,
      ref: "Disburse",
    },
    ref_id: {type: String},
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
        grade: {
          type: Schema.Types.ObjectId,
          ref: "Grade",
        },
      },
    ],
    payable_amount: {
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
    repayedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {timestamps: true}
)

export const grainRepaymentModel = model(
  "Grain_repayment",
  grainRepaymentSchema
)
