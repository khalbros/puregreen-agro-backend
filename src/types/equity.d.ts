import {IDisburse} from "./disburse"
import {IFarmer} from "./farmer"

export interface IEquity {
  farmer?: IFarmer
  amount_paid?: number
  status?: boolean
  paid_by?: string
  createdAt?: string
  updatedAt?: string
}
