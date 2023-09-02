export interface IWarehouse {
  _id?: string
  name?: string
  capacity?: string
  commodities?: {commodity: string; quantity: number}[]
  state?: string
  lga?: string
  address?: string
  isApproved?: boolean
  createdAt?: string
  updatedAt?: string
}
