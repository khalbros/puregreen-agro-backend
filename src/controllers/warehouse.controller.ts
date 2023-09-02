import {Request, Response} from "express"
import {warehouseModel} from "../models"
import {IWarehouse} from "../types/warehouse"
import {getUserRole} from "../utils"
import {populate} from "dotenv"

export const createWarehouse = async (req: Request, res: Response) => {
  try {
    const user_role = await getUserRole(req, res)
    if (!user_role) {
      return res.status(403).send({error: true, message: "Access Denied!"})
    }
    if (user_role !== "SUPER ADMIN") {
      return res.status(403).send({error: true, message: "Access Denied!"})
    }

    const {name, capacity, state, lga, address}: IWarehouse = req.body

    if (!name || !capacity || !state || !lga || !address) {
      return res.status(400).send({
        error: true,
        message: "inputs error (some fields are empty / invalid)",
      })
    }
    const nameCheck = await warehouseModel.findOne({name: name.toLowerCase()})
    if (nameCheck)
      return res
        .status(400)
        .send({error: true, message: "warehouse already exist"})

    const newWarehouse = await warehouseModel.create({
      name: name.toLowerCase(),
      capacity,
      state: state.toLowerCase(),
      lga: lga.toLowerCase(),
      address: address.toLowerCase(),
    })

    newWarehouse
      .save()
      .then(
        () => {
          return res
            .status(201)
            .send({error: false, message: "warehouse created successfully"})
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

export const getWarehouse = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please set a search key (ID not found)",
      })
    }

    const warehouse = await warehouseModel
      .findById(id)
      .populate("warehouse_manager")
      .populate("supervisors")
      .populate({path: "supervisors", populate: {path: "field_officers"}})
    if (!warehouse) {
      return res.status(404).send({
        error: true,
        message: "Warehouse not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "Success", data: warehouse})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const getAllWarehouses = async (req: Request, res: Response) => {
  try {
    const warehouses = await warehouseModel
      .find()
      .populate("warehouse_manager")
      .populate("supervisors")
      .populate({path: "supervisors", populate: {path: "field_officers"}})
    if (!warehouses) {
      return res.status(404).send({
        error: true,
        message: "Warehouse not found",
      })
    }
    return res
      .status(200)
      .send({error: false, message: "Success", data: warehouses})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const updateWarehouse = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    const user_role = await getUserRole(req, res)

    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please pass an ID to query",
      })
    }

    if (user_role !== "SUPER ADMIN") {
      return res.status(403).send({
        error: true,
        message: "Only Super admin can edit warehouse data",
      })
    }

    const warehouse = await warehouseModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!warehouse) {
      return res.status(404).send({
        error: true,
        message: "Warehouse not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "Warehouse updated", data: warehouse})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const deleteWarehouse = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    const user_role = await getUserRole(req, res)

    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please pass an ID to query",
      })
    }

    if (user_role !== "SUPER ADMIN") {
      return res.status(403).send({
        error: true,
        message: "Only Super admin can delete warehouse data",
      })
    }

    const warehouse = await warehouseModel.findByIdAndDelete(id)
    if (!warehouse) {
      return res.status(404).send({
        error: true,
        message: "Warehouse not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "Warehouse Deleted", data: warehouse})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}
