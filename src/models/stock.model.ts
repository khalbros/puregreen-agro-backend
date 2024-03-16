import {Schema, model} from "mongoose"

const stockSchema = new Schema(
  {
    product: {
      type: String,
      required: [true, "Product name is required but missing"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required but missing"],
    },
    quantity: {
      type: Number,
      required: [true, "Product quantity is required but missing"],
    },
    unit: {
      type: String,
      required: [true, "Product measurment unit is required but missing"],
    },
    shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
    },
    status: {
      type: String,
      default: "AVAILABLE",
    },
  },
  {timestamps: true}
)

export const stockModel = model("Stock", stockSchema)
