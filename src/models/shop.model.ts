import {Schema, model} from "mongoose"

const shopSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "shop name is missing"],
      unique: [
        true,
        "name already asign to other shop please choose a new name or update instead",
      ],
    },
    capacity: {
      type: String,
      required: [true, "shop capacity is missing"],
    },
    state: {
      type: String,
      required: [true, "state is missing"],
    },
    lga: {
      type: String,
      required: [true, "Local Govnt. is missing"],
    },
    address: {
      type: String,
      required: [true, "address is missing"],
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    sales_manager: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {timestamps: true}
)

export const shopModel = model("Shop", shopSchema)
