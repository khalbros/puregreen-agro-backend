import {Schema, model} from "mongoose"

const projectSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "name is missing"],
      unique: [
        true,
        "name already asign to other project please choose a new name or update instead",
      ],
    },
    code: {
      type: String,
      required: [true, "project code is missing"],
      unique: [
        true,
        "code already asign to other project please choose a new code or update instead",
      ],
    },
    start: {
      type: String,
    },
    end: {
      type: String,
    },
    status: {
      type: String,
      default: "PENDING",
    },
  },
  {timestamps: true}
)

export const projectModel = model("Project", projectSchema)
