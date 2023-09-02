export interface IVisitation {
  _id?: string
  farmer_id?: string
  visitation_count?: number
  farm_location?: {lng: string; lat: string}
  havest_date?: string
  commodity?: [string]
  comment?: string
  upload?: string
  visited_by?: string
  createdAt?: string
  updatedAt?: string
}
