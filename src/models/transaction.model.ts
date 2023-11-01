import {Schema, model} from "mongoose"

const transactionSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
    },
    ref_id: {
      type: String,
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: "Client",
    },
    commodity: {
      type: Schema.Types.ObjectId,
      ref: "Commodity",
    },
    grade: {
      type: Schema.Types.ObjectId,
      ref: "Grade",
    },
    net_weight: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
    },
    gross_weight: {
      type: String,
      required: true,
    },
    num_bags: {
      type: String,
      required: true,
    },
    truck_number: {
      type: String,
      required: true,
    },
    driver: {
      type: String,
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
    admin_fee: {
      type: Number,
    },
    logistics_fee: {
      type: Number,
    },
    handling_fee: {
      type: Number,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      default: "PENDING",
    },
  },
  {timestamps: true}
)

export const transactionModel = model("Transaction", transactionSchema)
