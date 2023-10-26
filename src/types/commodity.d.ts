export interface ICommodity {
  _id?: string
  name: string
  price: {loan?: number; trade?: number; storage?: number}
  isApproved?: boolean
  createdAt?: string
  updatedAt?: string
}
