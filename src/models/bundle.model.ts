import {Schema, model} from "mongoose"

const bundleSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    total: {
      type: String,
      required: true,
    },
    inputs: [
      {
        input: {
          type: String,
        },
        quantity: {type: String, required: true},
      },
    ],
  },
  {timestamps: true}
)

export const bundleModel = model("Bundle", bundleSchema)
