import {Schema, model} from "mongoose"

const gradeSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "name is missing"],
    },
    percentage: {
      type: Number,
      required: true,
    },
  },
  {timestamps: true}
)

export const gradeModel = model("Grade", gradeSchema)
