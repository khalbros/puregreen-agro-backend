import {Schema, model} from "mongoose"

const registerSchema = new Schema(
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
      type: Boolean,
      default: false,
    },
    paid_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {timestamps: true}
)

export const registerModel = model("Register", registerSchema)
