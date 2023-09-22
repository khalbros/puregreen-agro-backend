export interface ITransaction {
  _id?: string
  client: string
  type: string
  ref_id?: string
  commodity: string
  net_weight?: string
  duration?: number
  gross_weight: string
  num_bags: string
  truck_number: string
  driver: string
  amount?: string
  createdBy?: string
  status?: string
  createdAt?: string
  updatedAt?: string
}
