export interface IDispatch {
  _id?: string
  type: string
  client?: string
  warehouse?: string
  commodity: string
  gross_weight: string
  net_weight?: string
  num_bags: string
  driver: string
  truck_num: string
  status: EStatus
  isApproved: Boolean
  isReceived: Boolean
  createdBy: string
  receivedBy?: string
  approvedBy?: string
  createdAt?: string
  updatedAt?: string
}

enum EStatus {
  "PENDING",
  "APPROVED",
  "REJECTED",
  "COMPLETED",
  "CANCEL",
}
