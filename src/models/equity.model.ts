import {Schema, model} from "mongoose"

const equitySchema = new Schema(
  {
    farmer: {
      type: Schema.Types.ObjectId,
      ref: "Farmer",
    },
    amount_paid: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: "NOT PAID",
    },
    paid_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {timestamps: true}
)

export const equityModel = model("Equity", equitySchema)
