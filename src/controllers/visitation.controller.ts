import {Request, Response} from "express"
import {farmerModel, visitationModel} from "../models"
import {IVisitation} from "../types/visitation"
import {currentUser, getUserId, getUserRole} from "../utils"
import imageUpload from "../utils/file-upload"

async function fileUpload(file: any) {
  const filepath = `uploads/${Date.now() + "_" + file?.name}`
  try {
    file.mv(filepath, (err: any) => {
      if (err) {
        throw new Error(err)
      }
    })
  } catch (error: any) {
    throw new Error(error.message as string)
  }

  return "http://localhost:5000/" + filepath
}

export const createVisitation = async (req: Request, res: Response) => {
  try {
    const {
      farmer_id,
      visitation_count,
      farm_location,
      havest_date,
      commodity,
      comment,
      upload,
    }: IVisitation = req.body

    if (
      !farmer_id ||
      !visitation_count ||
      !farm_location ||
      !havest_date ||
      !commodity ||
      !comment ||
      !upload
    ) {
      return res.status(400).send({
        error: true,
        message: "visitations form error (some fields are empty / invalid)",
      })
    }
    const userId = await getUserId(req, res)
    const farmer = await farmerModel.findOne({farmer_id, supervisor: userId})
    if (!farmer) {
      return res.send({error: true, message: "Farmer Not Found"})
    }

    const comm = String(commodity)
      .split(",")
      .map((c) => c.trim())

    const newVisitation = await visitationModel.create({
      farmer_id,
      visitation_count,
      farm_location: JSON.parse(String(farm_location)),
      havest_date,
      commodity: comm,
      comment,
      upload: await imageUpload(upload),
      visited_by: userId,
    })
    if (!newVisitation) {
      return res.send({error: true, message: "Error submiting visitation"})
    }

    newVisitation
      .save()
      .then(
        () => {
          return res
            .status(201)
            .send({error: false, message: "visitation submited successfully"})
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

export const getVisitation = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please set a search key (ID not found)",
      })
    }

    const visitation = await visitationModel.findById(id).populate("visited_by")
    if (!visitation) {
      return res.status(404).send({
        error: true,
        message: "Visitation not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "Success", data: visitation})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const getAllVisitations = async (req: Request, res: Response) => {
  const user = await currentUser(req, res)
  try {
    if (user?.role === "SUPERVISOR") {
      const visitations = await visitationModel
        .find({visited_by: user.userId})
        .populate("visited_by")
        .sort({createdAt: -1})
      if (!visitations) {
        return res.status(404).send({
          error: true,
          message: "Visitation Empty",
        })
      }
      return res
        .status(200)
        .send({error: false, message: "Success", data: visitations})
    }
    const visitations = await visitationModel
      .find()
      .populate("visited_by")
      .sort({createdAt: -1})
    if (!visitations) {
      return res.status(404).send({
        error: true,
        message: "Visitation Empty",
      })
    }
    return res
      .status(200)
      .send({error: false, message: "Success", data: visitations})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const updateVisitation = async (req: Request, res: Response) => {
  try {
    const upload = req.files?.upload
    const {id} = req.params
    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please pass an ID to query",
      })
    }

    const visitation = await visitationModel.findByIdAndUpdate(
      id,
      {...req.body, upload: upload && (await fileUpload(upload))},
      {
        new: true,
        runValidators: true,
      }
    )
    if (!visitation) {
      return res.status(404).send({
        error: true,
        message: "Visitation not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "Visitation updated", data: visitation})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const deleteVisitation = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    const user_role = await getUserRole(req, res)

    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please pass an ID to query",
      })
    }

    const visitation = await visitationModel.findByIdAndDelete(id)
    if (!visitation) {
      return res.status(404).send({
        error: true,
        message: "Visitation not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "Visitation Deleted", data: visitation})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}
