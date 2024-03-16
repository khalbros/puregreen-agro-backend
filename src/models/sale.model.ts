import {timeStamp} from "console"
import {Schema, model} from "mongoose"

const saleSchema = new Schema(
  {
    ref_id: {
      type: String,
    },
    customer_name: {
      type: String,
      required: [true, "Customer name is required but missing"],
    },
    customer_number: {
      type: String,
      required: [true, "Customer number is required but missing"],
    },
    items: [
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
      },
    ],
    total: {
      type: Number,
      required: [true, "total amount is required but missing"],
    },
    amount_paid: {
      type: Number,
      required: [true, "total amount paid is required but missing"],
    },
    balance: {
      type: Number,
    },
    shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
    },
  },
  {timestamps: true}
)

export const saleModel = model("Sale", saleSchema)
