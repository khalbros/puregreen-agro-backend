import {IDisburse} from "./disburse"
import {IFarmer} from "./farmer"

export interface IEquity {
  farmer?: IFarmer
  amount_paid?: number
  amount_per_hectare?: number
  hectares?: number
  status?: boolean
  paid_by?: string
  createdAt?: string
  updatedAt?: string
}
