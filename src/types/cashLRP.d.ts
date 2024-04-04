import {IDisburse} from "./disburse"

export interface ICashLRP extends IDisburse {
  _id?: string
  disbursement?: string
  ref_id: string
  cash_paid?: number
  logistics_fee?: number
  processing_fee?: number
  status?: string
  repayedBy?: string
  createdAt?: string
  updatedAt?: string
}
