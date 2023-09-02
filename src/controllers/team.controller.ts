import {Request, Response} from "express"
import {cooperativeModel, farmerModel, teamModel} from "../models"
import {getUserRole} from "../utils"
import {ITeam} from "../types/team"
import mongoose from "mongoose"

export const createTeam = async (req: Request, res: Response) => {
  try {
    const {name, cooperativies, supervisor}: ITeam = req.body

    if (!name) {
      return res.status(400).send({
        error: true,
        message: "please enter Team name",
      })
    }
    if (!supervisor || supervisor === undefined) {
      return res.status(400).send({
        error: true,
        message: "please select supervisor",
      })
    }
    if (!cooperativies) {
      return res.status(400).send({
        error: true,
        message: "please select cooperative",
      })
    }
    const coopFilter = cooperativies?.filter(
      (coop) => coop !== null && coop !== undefined
    )
    if (coopFilter?.length < 1) {
      return res.status(400).send({
        error: true,
        message: "please select a valid cooperative",
      })
    }

    const codeCheck = await teamModel.findOne({name: name.toLowerCase()})
    if (codeCheck)
      return res.status(400).send({error: true, message: "team already exist"})

    const newTeam = await teamModel.create({
      name: name.toLowerCase(),
      cooperativies: coopFilter,
      supervisor: supervisor && supervisor,
    })

    newTeam
      .save()
      .then(
        (team) => {
          coopFilter.length > 0 &&
            team.cooperativies.map(async (cooperative) => {
              if (!cooperative) {
                return res.send({error: true, message: "Invalid Linked ID "})
              }
              const linked = await cooperativeModel.findByIdAndUpdate(
                {_id: cooperative},
                {team: team._id, supervisor: team.supervisor}
              )
              if (!linked) {
                return res.send({
                  error: true,
                  message: "Error Failed to link team",
                })
              }
            })
          return res.status(201).send({
            error: false,
            message: "team created successfully",
            data: team,
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

export const getTeam = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please set a search key (ID not found)",
      })
    }

    const team = await teamModel
      .findById(id)
      .populate("cooperativies")
      .populate("supervisor")
    if (!team) {
      return res.status(404).send({
        error: true,
        message: "Team not found",
      })
    }

    return res.status(200).send({error: false, message: "Success", data: team})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const getAllTeams = async (req: Request, res: Response) => {
  try {
    const teams = await teamModel
      .find()
      .populate("cooperativies")
      .populate("supervisor")
      .sort({createdAt: -1})
    if (!teams) {
      return res.status(404).send({
        error: true,
        message: "Team not found",
      })
    }
    return res.status(200).send({error: false, message: "Success", data: teams})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const updateTeam = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please pass an ID to query",
      })
    }

    const team = await teamModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!team) {
      return res.status(404).send({
        error: true,
        message: "Team not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "Team updated", data: team})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const deleteTeam = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    const user_role = await getUserRole(req, res)

    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please pass an ID to query",
      })
    }

    const team = await teamModel.findByIdAndDelete(id)
    if (!team) {
      return res.status(404).send({
        error: true,
        message: "Team not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "Team Deleted", data: team})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const getCooperativeMembers = async (req: Request, res: Response) => {
  const {id} = req.params
  try {
    const cooperatives = await farmerModel
      .find({cooperative: id, isApproved: true})
      .sort({createAt: -1})

    if (!cooperatives) {
      return res.status(404).send({
        error: true,
        message: "Cooperative not found",
      })
    }
    return res
      .status(200)
      .send({error: false, message: "Success", data: cooperatives})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const countCooperativeMembers = async (req: Request, res: Response) => {
  const {id} = req.params
  try {
    const cooperatives = await farmerModel
      .find({cooperative: id, isApproved: true})
      .count()

    if (!cooperatives) {
      return res.status(404).send({
        error: true,
        message: "Cooperative not found",
      })
    }
    return res
      .status(200)
      .send({error: false, message: "Success", data: cooperatives})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}
