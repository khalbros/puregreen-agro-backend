import {Request, Response} from "express"
import {inputModel, userModel} from "../models"
import {IInput} from "../types/input"
import {getUserId, getUserRole} from "../utils"

export const createInput = async (req: Request, res: Response) => {
  try {
    const {name, quantity, warehouse}: IInput = req.body

    if (!name) {
      return res.status(400).send({
        error: true,
        message: "inputs error (please enter input name)",
      })
    }
    const nameCheck = await inputModel.findOne({
      name: name.toLowerCase().trim(),
      warehouse,
    })
    if (nameCheck)
      return res.status(400).send({error: true, message: "input already exist"})

    const newInput = await inputModel.create({
      name: name.toLowerCase().trim(),
      quantity,
      warehouse,
    })

    newInput
      .save()
      .then(
        () => {
          return res
            .status(201)
            .send({error: false, message: "input created successfully"})
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

export const getInput = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please set a search key (ID not found)",
      })
    }

    const input = await inputModel.findById(id)
    if (!input) {
      return res.status(404).send({
        error: true,
        message: "Input not found",
      })
    }

    return res.status(200).send({error: false, message: "Success", data: input})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const getAllInputs = async (req: Request, res: Response) => {
  const queries = req.query
  try {
    const userId = await getUserId(req, res)
    const user = await userModel.findById(userId)
    if (queries) {
      if (queries.limit) {
        if (user?.role === "WAREHOUSE MANAGER") {
          const inputs = await inputModel
            .find({warehouse: user.warehouse, ...queries})
            .populate("warehouse", {name: true})
            .sort({createdAt: -1})
            .limit(Number(queries.limit))
          if (!inputs) {
            return res.status(404).send({
              error: true,
              message: "Input not found",
            })
          }
          return res
            .status(200)
            .send({error: false, message: "Success", data: inputs})
        }
        const inputs = await inputModel
          .find({...queries})
          .populate("warehouse", {name: true})
          .sort({createdAt: -1})
          .limit(Number(queries.limit))
        if (!inputs) {
          return res.status(404).send({
            error: true,
            message: "Input not found",
          })
        }
        return res
          .status(200)
          .send({error: false, message: "Success", data: inputs})
      }
      if (user?.role === "WAREHOUSE MANAGER") {
        const inputs = await inputModel
          .find({warehouse: user.warehouse, ...queries})
          .populate("warehouse", {name: true})
          .sort({createdAt: -1})
        if (!inputs) {
          return res.status(404).send({
            error: true,
            message: "Input not found",
          })
        }
        return res
          .status(200)
          .send({error: false, message: "Success", data: inputs})
      }
      const inputs = await inputModel
        .find({...queries})
        .populate("warehouse", {name: true})
        .sort({createdAt: -1})
      if (!inputs) {
        return res.status(404).send({
          error: true,
          message: "Input not found",
        })
      }
      return res
        .status(200)
        .send({error: false, message: "Success", data: inputs})
    }
    if (user?.role === "WAREHOUSE MANAGER") {
      const inputs = await inputModel
        .find({warehouse: user.warehouse})
        .populate("warehouse", {name: true})
        .sort({createdAt: -1})
      if (!inputs) {
        return res.status(404).send({
          error: true,
          message: "Input not found",
        })
      }
      return res
        .status(200)
        .send({error: false, message: "Success", data: inputs})
    }
    const inputs = await inputModel
      .find()
      .populate("warehouse", {name: true})
      .sort({createdAt: -1})
    if (!inputs) {
      return res.status(404).send({
        error: true,
        message: "Input not found",
      })
    }
    return res
      .status(200)
      .send({error: false, message: "Success", data: inputs})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const getAllApprovedInputs = async (req: Request, res: Response) => {
  const queries = req.query
  try {
    const userId = await getUserId(req, res)
    const user = await userModel.findById(userId)
    if (queries) {
      if (queries.limit) {
        if (user?.role === "WAREHOUSE MANAGER") {
          const inputs = await inputModel
            .find({warehouse: user.warehouse, isApproved: true, ...queries})
            .populate("warehouse", {name: true})
            .sort({createdAt: -1})
            .limit(Number(queries.limit))
          if (!inputs) {
            return res.status(404).send({
              error: true,
              message: "Input not found",
            })
          }
          return res
            .status(200)
            .send({error: false, message: "Success", data: inputs})
        }
        const inputs = await inputModel
          .find({...queries, isApproved: true})
          .populate("warehouse", {name: true})
          .sort({createdAt: -1})
          .limit(Number(queries.limit))
        if (!inputs) {
          return res.status(404).send({
            error: true,
            message: "Input not found",
          })
        }
        return res
          .status(200)
          .send({error: false, message: "Success", data: inputs})
      }
      if (user?.role === "WAREHOUSE MANAGER") {
        const inputs = await inputModel
          .find({warehouse: user.warehouse, isApproved: true, ...queries})
          .populate("warehouse", {name: true})
          .sort({createdAt: -1})
        if (!inputs) {
          return res.status(404).send({
            error: true,
            message: "Input not found",
          })
        }
        return res
          .status(200)
          .send({error: false, message: "Success", data: inputs})
      }
      const inputs = await inputModel
        .find({...queries, isApproved: true})
        .populate("warehouse", {name: true})
        .sort({createdAt: -1})
      if (!inputs) {
        return res.status(404).send({
          error: true,
          message: "Input not found",
        })
      }
      return res
        .status(200)
        .send({error: false, message: "Success", data: inputs})
    }
    if (user?.role === "WAREHOUSE MANAGER") {
      const inputs = await inputModel
        .find({warehouse: user.warehouse, isApproved: true})
        .populate("warehouse", {name: true})
        .sort({createdAt: -1})
      if (!inputs) {
        return res.status(404).send({
          error: true,
          message: "Input not found",
        })
      }
      return res
        .status(200)
        .send({error: false, message: "Success", data: inputs})
    }
    const inputs = await inputModel
      .find({isApproved: true})
      .populate("warehouse", {name: true})
      .sort({createdAt: -1})
    if (!inputs) {
      return res.status(404).send({
        error: true,
        message: "Input not found",
      })
    }
    return res
      .status(200)
      .send({error: false, message: "Success", data: inputs})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const getInputs = async (req: Request, res: Response) => {
  const queries = req.query
  try {
    const userId = await getUserId(req, res)
    const inputs = await inputModel.find({isApproved: true}).distinct("name")

    if (!inputs) {
      return res.status(404).send({
        error: true,
        message: "Input not found",
      })
    }
    return res
      .status(200)
      .send({error: false, message: "Success", data: inputs})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const ApproveInput = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please pass an ID to query",
      })
    }

    const input = await inputModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!input) {
      return res.status(404).send({
        error: true,
        message: "Input not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "Input updated", data: input})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const updateInput = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please pass an ID to query",
      })
    }

    const input = await inputModel.findByIdAndUpdate(
      id,
      {...req.body, name: req.body.name.toLowerCase(), isApproved: false},
      {
        new: true,
        runValidators: true,
      }
    )
    if (!input) {
      return res.status(404).send({
        error: true,
        message: "Input not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "Input updated", data: input})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const deleteInput = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    const user_role = await getUserRole(req, res)

    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please pass an ID to query",
      })
    }

    const input = await inputModel.findByIdAndDelete(id)
    if (!input) {
      return res.status(404).send({
        error: true,
        message: "Input not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "Input Deleted", data: input})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}
