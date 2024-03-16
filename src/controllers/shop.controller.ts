import {Request, Response} from "express"
import {shopModel} from "../models"
import {IShop} from "../types/shop"
import {getUserRole} from "../utils"

export const createShop = async (req: Request, res: Response) => {
  try {
    const user_role = await getUserRole(req, res)
    if (!user_role) {
      return res.status(403).send({error: true, message: "Access Denied!"})
    }
    if (user_role !== "SUPER ADMIN" && user_role !== "DATA ANALYST") {
      return res.status(403).send({error: true, message: "Access Denied!"})
    }

    const {name, capacity, state, lga, address}: IShop = req.body

    if (!name || !capacity || !state || !lga || !address) {
      return res.status(400).send({
        error: true,
        message: "inputs error (some fields are empty / invalid)",
      })
    }
    const nameCheck = await shopModel.findOne({name: name.toLowerCase()})
    if (nameCheck)
      return res.status(400).send({error: true, message: "shop already exist"})

    const newShop = await shopModel.create({
      name: name.toLowerCase(),
      capacity,
      state: state.toLowerCase(),
      lga: lga.toLowerCase(),
      address: address.toLowerCase(),
    })

    newShop
      .save()
      .then(
        () => {
          return res
            .status(201)
            .send({error: false, message: "shop created successfully"})
        },
        (err) => {
          return res.send({error: true, message: err?.message})
        }
      )
      .catch((err) => {
        return res.send({error: true, message: err?.message})
      })
  } catch (error: any) {
    return res.send({error: true, message: error?.message})
  }
}

export const getShop = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please set a search key (ID not found)",
      })
    }

    const shop = await shopModel.findById(id).populate("sales_manager")

    if (!shop) {
      return res.status(404).send({
        error: true,
        message: "Shop not found",
      })
    }

    return res.status(200).send({error: false, message: "Success", data: shop})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const getAllShops = async (req: Request, res: Response) => {
  try {
    const shops = await shopModel.find().populate("sales_manager")

    if (!shops) {
      return res.status(404).send({
        error: true,
        message: "Shop not found",
      })
    }
    return res.status(200).send({error: false, message: "Success", data: shops})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const updateShop = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    const user_role = await getUserRole(req, res)

    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please pass an ID to query",
      })
    }

    if (user_role !== "SUPER ADMIN" && user_role !== "DATA ANALYST") {
      return res.status(403).send({
        error: true,
        message: "Only Super admin can edit shop data",
      })
    }

    const shop = await shopModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!shop) {
      return res.status(404).send({
        error: true,
        message: "Shop not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "Shop updated", data: shop})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const deleteShop = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    const user_role = await getUserRole(req, res)

    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please pass an ID to query",
      })
    }

    if (user_role !== "SUPER ADMIN" && user_role !== "DATA ANALYST") {
      return res.status(403).send({
        error: true,
        message: "Only Super admin can delete shop data",
      })
    }

    const shop = await shopModel.findByIdAndDelete(id)
    if (!shop) {
      return res.status(404).send({
        error: true,
        message: "Shop not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "Shop Deleted", data: shop})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}
