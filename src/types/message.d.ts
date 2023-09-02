export interface IMessage {
  to?: string
  from?: string
  message: string
  isRead?: boolean
  createdAt?: string
  updatedAt?: string
}
