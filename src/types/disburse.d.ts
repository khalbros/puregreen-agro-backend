export interface IDisburse {
  _id?: string
  ref_id: string
  farmer: string
  bundle?: string
  hectares?: number
  equity?: string
  loan_amount?: number
  repayment_amount?: number
  outstanding_loan?: number
  payable_amount?: number
  overage?: number
  commodities?: {
    commodity: string
    quantity: number
    gross_weight: string
    net_weight: string
    pp: string
    grade: string
  }[]
  gross_weight?: number
  net_weight?: number
  num_bags?: number
  cash?: number
  logistics_fee?: number
  processing_fee?: number
  status?: string
  isApproved?: boolean
  isEquityPaid?: boolean
  disbursedBy?: string
  repayedBy?: string
  repayment_type?: string
  warehouse?: string
  createdAt?: string
  updatedAt?: string
}
