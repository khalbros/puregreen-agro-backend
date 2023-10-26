export interface IWarehouse {
  _id?: string
  name?: string
  capacity?: string
  commodities?: {
    commodity: string
    quantity: number
    weight: number
    grade: string
  }[]
  state?: string
  lga?: string
  address?: string
  isApproved?: boolean
  createdAt?: string
  updatedAt?: string
}
