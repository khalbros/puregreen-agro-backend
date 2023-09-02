import {Schema, model} from "mongoose"

const messageSchema = new Schema(
  {
    message: {
      type: String,
      required: [true, "message is required"],
    },
    from: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {timestamps: true}
)

export const messageModel = model("Message", messageSchema)
