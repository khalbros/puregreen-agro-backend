import {Schema, model} from "mongoose"

const warehouseSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "warehouse name is missing"],
      unique: [
        true,
        "name already asign to other warehouse please choose a new name or update instead",
      ],
    },
    capacity: {
      type: String,
      required: [true, "warehouse capacity is missing"],
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
    commodities: [
      {
        commodity: {
          type: Schema.Types.ObjectId,
          ref: "Commodity",
        },
        weight: {type: Number, required: true},
        quantity: {type: Number, required: true},
        grade: {
          type: Schema.Types.ObjectId,
          ref: "Grade",
        },
      },
    ],
    warehouse_manager: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    supervisors: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {timestamps: true}
)

export const warehouseModel = model("Warehouse", warehouseSchema)
