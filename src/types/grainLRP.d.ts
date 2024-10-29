import { IDisburse } from "./disburse"

export interface IGrainLRP extends IDisburse {
  _id?: string
  disbursement: string
  ref_id: string
  commodities?: {
    commodity: string
    quantity: number
    gross_weight: string
    net_weight: string
    pp: string
    grade: string
  }[]
  payable_amount?: number
  gross_weight?: number
  net_weight?: number
  num_bags?: number
  logistics_fee?: number
  processing_fee?: number
  status?: string
  warehouse?: string
  repayedBy?: string
  createdAt?: string
  updatedAt?: string
}
