import {Schema, model} from "mongoose"

const commoditySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    grade: {
      type: Schema.Types.ObjectId,
      ref: "Grade",
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  {timestamps: true}
)

export const commodityModel = model("Commodity", commoditySchema)
