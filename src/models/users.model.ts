import {Schema, model} from "mongoose"

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: [
        true,
        "email already exist please choose a new email or login instead",
      ],
    },
    phone: {
      type: String,
      required: [true, "phone number is required"],
      unique: [
        true,
        "phone number already exist please choose a new phone number or login instead",
      ],
    },
    gender: {
      type: String,
      required: [true, "gender is required"],
    },
    profile_img: {
      type: String,
    },
    address: {
      type: String,
    },
    warehouse: {
      type: Schema.Types.ObjectId,
      ref: "Warehouse",
    },
    supervisor: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    field_officers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    password: {
      type: String,
      required: [true, "password is required"],
    },
    role: {
      type: String,
      required: [true, "role is required"],
    },
    isEnable: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {timestamps: true}
)

export const userModel = model("User", userSchema)
