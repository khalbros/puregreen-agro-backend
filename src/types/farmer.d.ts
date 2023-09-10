import {ICooperative} from "./cooperative"

export interface IFarmer {
  _id?: string
  farmer_id?: string
  name: string
  gender: string
  date_of_birth: string
  phone: string
  state: string
  lga: string
  village: string
  address: string
  id_type: string
  id_number: string
  id_card: string
  cooperative: string
  role: string
  guarantor_name: string
  guarantor_number: string
  guarantor_village: string
  guarantor_id_type: string
  guarantor_id_number: string
  guarantor_id: string
  guarantor_address: string
  profile_img: string
  field_officer?: string
  supervisor?: string
  isApproved?: boolean
  createdAt?: string
  updatedAt?: string
}
