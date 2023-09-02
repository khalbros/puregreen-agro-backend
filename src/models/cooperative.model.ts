import {Schema, model} from "mongoose"

const cooperativeSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Cooperative name is missing"],
      unique: [
        true,
        "name already asign to other cooperative please choose a new name or update instead",
      ],
    },
    chairman: {
      type: String,
      required: [true, "Chairman's name is missing"],
    },
    phone: {
      type: String,
      required: [true, "cooperative phone number is missing"],
    },
    team: {
      type: Schema.Types.ObjectId,
      ref: "Team",
    },
    supervisor: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    village: {
      type: String,
      required: [true, "Cooperative village is missing"],
    },
    village_head: {
      type: String,
      required: [true, "Village head name is missing"],
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  {timestamps: true}
)

export const cooperativeModel = model("Cooperative", cooperativeSchema)
