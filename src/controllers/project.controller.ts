import {Request, Response} from "express"
import {projectModel} from "../models"
import {getUserRole} from "../utils"
import {IProject} from "../types/project"

export const createProject = async (req: Request, res: Response) => {
  try {
    const {name, code, start, end}: IProject = req.body

    if (!name || !code || !start) {
      return res.status(400).send({
        error: true,
        message: "projects error (some fields are empty / invalid)",
      })
    }
    const codeCheck = await projectModel.findOne({code})
    if (codeCheck)
      return res
        .status(400)
        .send({error: true, message: "project already exist"})

    const newProject = await projectModel.create({
      name: name.toLowerCase(),
      code,
      start,
      end,
    })

    newProject
      .save()
      .then(
        () => {
          return res.status(201).send({
            error: false,
            message: "project created successfully",
            data: newProject,
          })
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

export const getProject = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please set a search key (ID not found)",
      })
    }

    const project = await projectModel.findById(id)
    if (!project) {
      return res.status(404).send({
        error: true,
        message: "Project not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "Success", data: project})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const projects = await projectModel.find()
    if (!projects) {
      return res.status(404).send({
        error: true,
        message: "Project not found",
      })
    }
    return res
      .status(200)
      .send({error: false, message: "Success", data: projects})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const updateProject = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please pass an ID to query",
      })
    }

    const project = await projectModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!project) {
      return res.status(404).send({
        error: true,
        message: "Project not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "Project updated", data: project})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    const user_role = await getUserRole(req, res)

    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please pass an ID to query",
      })
    }

    const project = await projectModel.findByIdAndDelete(id)
    if (!project) {
      return res.status(404).send({
        error: true,
        message: "Project not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "Project Deleted", data: project})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}
