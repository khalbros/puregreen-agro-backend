import {Schema, model} from "mongoose"

const farmerSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
    },
    farmer_id: {
      type: String,
      required: [true, "farmer id is required"],
      unique: [true, "conflict farmer id already exist"],
    },
    gender: {
      type: String,
      required: [true, "gender is required"],
    },
    date_of_birth: {
      type: String,
      required: [true, "date of birth is required"],
    },
    phone: {
      type: String,
      required: [true, "phone number is required"],
      unique: [true, "phone number already exist"],
    },
    state: {
      type: String,
      required: [true, "state is required"],
    },
    lga: {
      type: String,
      required: [true, "lga is required"],
    },
    village: {
      type: String,
      required: [true, "village is required"],
    },
    address: {
      type: String,
      required: [true, "residental address is required"],
    },
    farm_location: {
      type: String,
    },
    id_type: {
      type: String,
      required: [true, "id card type is required"],
    },
    id_number: {
      type: String,
      required: [true, "id card number is required"],
    },
    id_card: {
      type: String,
      required: [true, "id card is required"],
    },
    profile_img: {
      type: String,
    },
    cooperative: {
      type: Schema.Types.ObjectId,
      ref: "Cooperative",
    },
    role: {
      type: String,
      required: [true, "role is required"],
    },
    guarantor_name: {
      type: String,
      required: [true, "guarantor name is required"],
    },
    guarantor_number: {
      type: String,
      required: [true, "guarantor number is required"],
    },
    guarantor_village: {
      type: String,
      required: [true, "guarantor village is required"],
    },
    guarantor_id_type: {
      type: String,
      required: [true, "guarantor id type is required"],
    },
    guarantor_id_number: {
      type: String,
      required: [true, "guarantor id number is required"],
    },
    guarantor_id: {
      type: String,
      required: [true, "guarantor id is required"],
    },
    guarantor_address: {
      type: String,
      required: [true, "guarantor address is required"],
    },
    field_officer: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    supervisor: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reg_amount: {
      type: Number,
    },
    equity_amount: {
      type: Number,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
  },
  {timestamps: true}
)

export const farmerModel = model("Farmer", farmerSchema)
