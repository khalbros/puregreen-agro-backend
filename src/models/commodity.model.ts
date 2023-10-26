import {Schema, model} from "mongoose"

const commoditySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: [
      {
        loan: Number,
        trade: Number,
        storage: Number,
      },
    ],
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  {timestamps: true}
)

export const commodityModel = model("Commodity", commoditySchema)
