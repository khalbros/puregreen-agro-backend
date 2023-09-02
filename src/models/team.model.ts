import {Schema, model} from "mongoose"

const teamSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "name is missing"],
      unique: [
        true,
        "name already asign to other team please choose a new name or update instead",
      ],
    },
    supervisor: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    cooperativies: [
      {
        type: Schema.Types.ObjectId,
        ref: "Cooperative",
      },
    ],
  },
  {timestamps: true}
)

export const teamModel = model("Team", teamSchema)
