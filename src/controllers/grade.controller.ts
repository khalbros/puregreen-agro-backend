import {Request, Response} from "express"
import {gradeModel} from "../models"
import {IGrade} from "../types/grade"
import {getUserRole} from "../utils"

export const createGrade = async (req: Request, res: Response) => {
  try {
    const {name, percentage}: IGrade = req.body

    if (!name || !percentage) {
      return res.status(400).send({
        error: true,
        message: "grades error (some fields are empty / invalid)",
      })
    }
    const nameCheck = await gradeModel.findOne({name: name.toLowerCase()})
    if (nameCheck)
      return res.status(400).send({error: true, message: "grade already exist"})

    const newGrade = await gradeModel.create({
      name: name.toLowerCase(),
      percentage,
    })

    newGrade
      .save()
      .then(
        () => {
          return res
            .status(201)
            .send({error: false, message: "grade created successfully"})
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

export const getGrade = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please set a search key (ID not found)",
      })
    }

    const grade = await gradeModel.findById(id)
    if (!grade) {
      return res.status(404).send({
        error: true,
        message: "Grade not found",
      })
    }

    return res.status(200).send({error: false, message: "Success", data: grade})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const getAllGrades = async (req: Request, res: Response) => {
  try {
    const grades = await gradeModel.find()
    if (!grades) {
      return res.status(404).send({
        error: true,
        message: "Grade not found",
      })
    }
    return res
      .status(200)
      .send({error: false, message: "Success", data: grades})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const updateGrade = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please pass an ID to query",
      })
    }

    const grade = await gradeModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!grade) {
      return res.status(404).send({
        error: true,
        message: "Grade not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "Grade updated", data: grade})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const deleteGrade = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    const user_role = await getUserRole(req, res)

    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please pass an ID to query",
      })
    }

    const grade = await gradeModel.findByIdAndDelete(id)
    if (!grade) {
      return res.status(404).send({
        error: true,
        message: "Grade not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "Grade Deleted", data: grade})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}
