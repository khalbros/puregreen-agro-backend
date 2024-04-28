import {Schema, model} from "mongoose"

const dispatchSchema = new Schema(
  {
    type: {
      type: String,
      required: [true, "dispatch type is missing"],
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: "Client",
    },
    warehouse: {
      type: Schema.Types.ObjectId,
      ref: "Warehouse",
    },
    commodity: {
      type: Schema.Types.ObjectId,
      ref: "Commodity",
    },
    input: {
      type: Schema.Types.ObjectId,
      ref: "Input",
    },
    grade: {
      type: Schema.Types.ObjectId,
      ref: "Grade",
    },
    gross_weight: {
      type: String,
    },
    net_weight: {
      type: String,
    },
    num_bags: {
      type: Number,
      required: [true, "number of bags is missing"],
    },
    driver: {
      type: String,
      required: [true, "driver's name is missing"],
    },
    truck_num: {
      type: String,
      required: [true, "driver's name is missing"],
    },
    status: {
      type: String,
      default: "PENDING",
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isReceived: {
      type: Boolean,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {timestamps: true}
)

export const dispatchModel = model("Dispatch", dispatchSchema)
