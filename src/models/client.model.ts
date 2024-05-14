import {Schema, model} from "mongoose"

const clientSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
    },
    client_id: {
      type: String,
      required: [true, "client id is required"],
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: [true, "email already exist please choose a new email"],
    },
    phone: {
      type: String,
      required: [true, "phone number is required"],
      unique: [
        true,
        "phone number already exist please choose a new phone number",
      ],
    },
    address: {
      type: String,
      required: [true, "residental address is required"],
    },
    account_number: {
      type: String,
      required: [true, "acount number is required"],
      unique: [
        true,
        "account number already exist please choose a new account number",
      ],
    },
    bank_name: {
      type: String,
      required: [true, "bank name is required"],
    },
  },
  {timestamps: true}
)

export const clientModel = model("Client", clientSchema)
