import {IDisburse} from "./disburse"

export interface IRegister {
  farmer?: string
  amount_paid?: number
  status?: string
  paid_by?: string
  createdAt?: string
  updatedAt?: string
}
