import {Request, Response} from "express"
import {clientModel} from "../models"
import {IClient} from "../types/client"
import {generateClientID, getUserId, getUserRole} from "../utils"

export const createClient = async (req: Request, res: Response) => {
  try {
    const user_role = await getUserRole(req, res)
    if (!user_role) {
      return
    }
    if (user_role !== "WAREHOUSE MANAGER") {
      return res.status(403).send({error: true, message: "Access Denied!"})
    }

    const {name, email, phone, account_number, bank_name, address}: IClient =
      req.body

    if (
      !name ||
      !email ||
      !phone ||
      !account_number ||
      !bank_name ||
      !address
    ) {
      return res.status(400).send({
        error: true,
        message: "Client inputs error (some fields are empty / invalid)",
      })
    }
    const emailCheck = await clientModel.findOne({email: email.toLowerCase()})
    if (emailCheck)
      return res.status(400).send({error: true, message: "Email already exist"})

    const phoneCheck = await clientModel.findOne({phone})
    if (phoneCheck)
      return res
        .status(400)
        .send({error: true, message: "Phone number already exist"})

    const accountCheck = await clientModel.findOne({account_number})
    if (accountCheck)
      return res
        .status(400)
        .send({error: true, message: "Account number already exist"})

    const newClient = await clientModel.create({
      ...req.body,
      client_id: await generateClientID(),
      name: name.toLowerCase(),
      email: email.toLowerCase(),
      bank_name: bank_name.toLowerCase(),
    })

    newClient
      .save()
      .then(
        () => {
          return res
            .status(201)
            .send({error: false, message: "Client created successfully"})
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

export const getClient = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please set a search key (No ID found)",
      })
    }

    const client = await clientModel.findById(id)
    if (!client) {
      return res.status(404).send({
        error: true,
        message: "Client not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "Success", data: client})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const getAllClients = async (req: Request, res: Response) => {
  try {
    const clients = await clientModel.find().sort({createdAt: -1})
    return res
      .status(200)
      .send({error: false, message: "Success", data: clients})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const updateClient = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    const currentUserId = await getUserId(req, res)
    const user_role = await getUserRole(req, res)

    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please pass an ID to query",
      })
    }

    if (user_role !== "WAREHOUSE MANAGER" && currentUserId !== id) {
      return res.status(403).send({
        error: true,
        message: "Only warehouse manager can edit other clients data",
      })
    }

    const client = await clientModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!client) {
      return res.status(404).send({
        error: true,
        message: "Client not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "Client updated", data: client})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const deleteClient = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please pass an ID to query (No ID found)",
      })
    }

    const client = await clientModel.findByIdAndDelete(id)
    if (!client) {
      return res.status(404).send({
        error: true,
        message: "Client not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "Client Deleted", data: client})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const countAllClients = async (req: Request, res: Response) => {
  try {
    const clients = await clientModel.find().count()
    return res
      .status(200)
      .send({error: false, message: "Success", data: clients})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}
