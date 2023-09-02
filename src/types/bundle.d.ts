export interface IBundle {
  _id?: string
  name: string
  total: string
  inputs: {input: string; quantity: string}[]
  createdAt?: string
  updatedAt?: string
}
