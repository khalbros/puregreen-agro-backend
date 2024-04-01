import {Schema, model} from "mongoose"

const visitationSchema = new Schema(
  {
    farmer_id: {
      type: String,
      required: [true, "Farmer Id is missing"],
    },
    visitation_count: {
      type: Number,
      required: true,
    },
    farm_location: {
      lng: {type: String, required: [true, "longitude is missing"]},
      lat: {type: String, required: [true, "latitude is missing"]},
    },
    havest_date: {
      type: String,
      required: true,
    },
    commodity: [
      {
        type: String,
        required: true,
      },
    ],
    comment: {
      type: String,
    },
    upload: {
      type: String,
    },
    visited_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {timestamps: true}
)

export const visitationModel = model("Visitation", visitationSchema)
