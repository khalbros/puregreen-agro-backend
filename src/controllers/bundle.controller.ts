import {Request, Response} from "express"
import {bundleModel} from "../models"
import {IBundle} from "../types/bundle"
import {getUserRole} from "../utils"

export const createBundle = async (req: Request, res: Response) => {
  try {
    const {name, total, inputs}: IBundle = req.body

    if (!name || !total || !inputs) {
      return res.status(400).send({
        error: true,
        message: "bundles error (some fields are empty / invalid)",
      })
    }
    const nameCheck = await bundleModel.findOne({name: name.toLowerCase()})
    if (nameCheck)
      return res
        .status(400)
        .send({error: true, message: "bundle already exist"})

    const newBundle = await bundleModel.create({
      name: name.toLowerCase(),
      total,
      inputs,
    })

    newBundle
      .save()
      .then(
        () => {
          return res
            .status(201)
            .send({error: false, message: "bundle created successfully"})
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

export const getBundle = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please set a search key (ID not found)",
      })
    }

    const bundle = await bundleModel.findById(id)
    if (!bundle) {
      return res.status(404).send({
        error: true,
        message: "Bundle not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "Success", data: bundle})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const getAllBundles = async (req: Request, res: Response) => {
  try {
    const bundles = await bundleModel.find().sort({createdAt: -1})
    if (!bundles) {
      return res.status(404).send({
        error: true,
        message: "Bundle not found",
      })
    }
    return res
      .status(200)
      .send({error: false, message: "Success", data: bundles})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const updateBundle = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please pass an ID to query",
      })
    }

    const bundle = await bundleModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!bundle) {
      return res.status(404).send({
        error: true,
        message: "Bundle not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "Bundle updated", data: bundle})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const deleteBundle = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    const user_role = await getUserRole(req, res)

    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please pass an ID to query",
      })
    }

    const bundle = await bundleModel.findByIdAndDelete(id)
    if (!bundle) {
      return res.status(404).send({
        error: true,
        message: "Bundle not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "Bundle Deleted", data: bundle})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}
