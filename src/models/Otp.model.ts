import {Schema, model} from "mongoose"

const otpSchema = new Schema(
  {
    otp: {
      type: String,
      required: [true, "OTP is missing"],
    },
    user: {
      type: String,
      required: [true, "User email is missing"],
    },
    dispatch_id: {
      type: Schema.Types.ObjectId,
      ref: "Dispatch",
    },
    expire_in: {
      type: String,
      required: true,
    },
  },
  {timestamps: true}
)

export const otpModel = model("Otp", otpSchema)
