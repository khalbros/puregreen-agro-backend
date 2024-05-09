import {Schema, model} from "mongoose"

const inputSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "name is missing"],
    },
    warehouse: {
      type: Schema.Types.ObjectId,
      ref: "Warehouse",
    },
    quantity: {
      type: Number,
    },
    quantity_out: {
      type: Number,
    },
    isApproved: {type: Boolean, default: false},
  },
  {timestamps: true}
)

export const inputModel = model("Input", inputSchema)
