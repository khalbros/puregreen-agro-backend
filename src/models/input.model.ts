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
      required: true,
    },
    quantity_out: {
      type: Number,
    },
  },
  {timestamps: true}
)

export const inputModel = model("Input", inputSchema)
