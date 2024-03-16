export interface ISale {
  _id?: string
  ref_id?: string
  customer_name?: string
  customer_number?: string
  items?: [{product: string; price?: number; quantity?: number; unit?: string}]
  total?: number
  amount_paid?: number
  balance?: number
  shop?: string
  createdAt?: string
  updatedAt?: string
}
