export interface IUser {
  _id?: string
  name: string
  email: string
  phone: string
  gender: string
  warehouse?: string
  supervisor?: string
  address?: string
  profile_img?: string
  password?: string
  role?: string
  isEnable?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface IVerifedToken {
  userId: string
  name: string
  email: string
  phone: string
  role: string
  isEnable: boolean
}
