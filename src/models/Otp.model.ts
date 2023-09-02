import {Schema, model} from "mongoose"

const otpSchema = new Schema(
  {
    otp: {
      type: String,
      required: [true, "OTP is missing"],
    },
    user_email: {
      type: Schema.Types.ObjectId,
      ref: "User",
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
