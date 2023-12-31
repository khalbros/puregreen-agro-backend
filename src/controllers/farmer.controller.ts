import {Request, Response} from "express"
import {farmerModel, userModel} from "../models"
import {IFarmer} from "../types/farmer"
import {currentUser, generateFarmerID, getUserId, getUserRole} from "../utils"
import mongoose from "mongoose"
import imageUpload from "../utils/file-upload"
import {UploadedFile} from "express-fileupload"
import {IWarehouse} from "../types/warehouse"

async function fileUpload(file: UploadedFile) {
  const filepath = `uploads/${Date.now() + "_" + file?.name}`
  file.mv(filepath, (err: any) => {
    if (err) {
      throw new Error(err)
    }
  })

  return "http://localhost:5000/" + filepath
}

export const createFarmer = async (req: Request, res: Response) => {
  // const profile_img = req.files?.profile_img
  // const id_card = req.files?.id_card
  // const guarantor_id = req.files?.guarantor_id

  const env = process.env.NODE_ENV
  try {
    const {
      name,
      gender,
      date_of_birth,
      phone,
      address,
      state,
      lga,
      village,
      id_type,
      id_number,
      cooperative,
      role,
      guarantor_name,
      guarantor_number,
      guarantor_village,
      guarantor_id_type,
      guarantor_id_number,
      guarantor_address,
      id_card,
      guarantor_id,
      profile_img,
    }: IFarmer = req.body

    if (
      !name ||
      !gender ||
      !date_of_birth ||
      !state ||
      !lga ||
      !village ||
      !address ||
      !id_type ||
      !id_number ||
      !guarantor_name ||
      !guarantor_number ||
      !guarantor_address ||
      !guarantor_village ||
      !guarantor_id_type ||
      !guarantor_id_number ||
      !cooperative ||
      !role
    ) {
      return res.status(400).send({
        error: true,
        message: "Farmer inputs error (some fields are empty / invalid)",
      })
    }
    const cuser = await getUserId(req, res)
    const user = await userModel.findById(cuser)

    const phoneCheck = await farmerModel.findOne({phone})
    if (phoneCheck)
      return res
        .status(400)
        .send({error: true, message: "Phone number already exist"})

    const ninCheck = await farmerModel.findOne({id_number})
    if (ninCheck)
      return res
        .status(400)
        .send({error: true, message: `${id_type} number already exist`})

    const newFarmer = await farmerModel.create({
      ...req.body,
      farmer_id: await generateFarmerID(),
      name: name.toLowerCase(),
      profile_img: profile_img && (await imageUpload(profile_img)),
      id_card: id_card && (await imageUpload(id_card)),
      guarantor_id: guarantor_id && (await imageUpload(guarantor_id)),
      guarantor_name: guarantor_name.toLowerCase(),
      field_officer: user?._id,
      supervisor:
        user?.role === "WAREHOUSE ADMIN" ? user?._id : user?.supervisor,
    })

    newFarmer
      .save()
      .then(
        () => {
          return res
            .status(201)
            .send({error: false, message: "Farmer created successfully"})
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

export const getFarmer = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please set a search key (No ID found)",
      })
    }

    const farmer = await farmerModel
      .findById(id)
      .populate("field_officer")
      .populate("cooperative")
      .populate("supervisor")
      .populate({
        path: "cooperative",
        populate: {path: "team"},
      })
    if (!farmer) {
      return res.status(404).send({
        error: true,
        message: "Farmer not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "Success", data: farmer})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const getAllApprovedFarmers = async (req: Request, res: Response) => {
  const cuser = await currentUser(req, res)

  const query = req.query
  try {
    const user = await userModel.findById(cuser?.userId).populate("warehouse")

    if (query) {
      if (query.limit) {
        if (user?.role === "WAREHOUSE ADMIN") {
          const farmers = await farmerModel
            .find({
              ...query,
              supervisor: user?._id,
              isApproved: true,
            })
            .populate("field_officer")
            .populate("supervisor")
            .populate("cooperative")
            .populate({
              path: "cooperative",
              populate: {path: "team"},
            })
            .sort({createdAt: -1})
            .limit(Number(query.limit))
          return res
            .status(200)
            .send({error: false, message: "Success", data: farmers})
        }
        if (user?.role === "FIELD OFFICER") {
          const farmers = await farmerModel
            .find({
              ...query,
              field_officer: user?._id,
              isApproved: true,
            })
            .populate("field_officer")
            .populate("cooperative")
            .populate("supervisor")
            .populate({
              path: "cooperative",
              populate: {path: "team"},
            })
            .sort({createdAt: -1})
            .limit(Number(query.limit))
          return res
            .status(200)
            .send({error: false, message: "Success", data: farmers})
        }
        if (user?.role === "WAREHOUSE MANAGER") {
          const farmers = await farmerModel
            .find({
              supervisor: {$in: (user?.warehouse as any)?.supervisors},
              isApproved: true,
              ...query,
            })
            .populate("field_officer")
            .populate("supervisor")
            .populate("cooperative")
            .populate({
              path: "cooperative",
              populate: {path: "team"},
            })
            .sort({createdAt: -1})
            .limit(Number(query.limit))
          return res
            .status(200)
            .send({error: false, message: "Success", data: farmers})
        }
        const farmers = await farmerModel
          .find({isApproved: true, ...query})
          .populate("field_officer")
          .populate("cooperative")
          .populate("supervisor")
          .populate({
            path: "cooperative",
            populate: {path: "team"},
          })
          .sort({createdAt: -1})
          .limit(Number(query.limit))
        return res
          .status(200)
          .send({error: false, message: "Success", data: farmers})
      }
      if (user?.role === "WAREHOUSE ADMIN") {
        const farmers = await farmerModel
          .find({
            ...query,
            supervisor: user?._id,
            isApproved: true,
          })
          .populate("field_officer")
          .populate("supervisor")
          .populate("cooperative")
          .populate({
            path: "cooperative",
            populate: {path: "team"},
          })
          .sort({createdAt: -1})
        return res
          .status(200)
          .send({error: false, message: "Success", data: farmers})
      }
      if (user?.role === "FIELD OFFICER") {
        const farmers = await farmerModel
          .find({
            ...query,
            field_officer: user?._id,
            isApproved: true,
          })
          .populate("field_officer")
          .populate("cooperative")
          .populate("supervisor")
          .populate({
            path: "cooperative",
            populate: {path: "team"},
          })
          .sort({createdAt: -1})
        return res
          .status(200)
          .send({error: false, message: "Success", data: farmers})
      }
      if (user?.role === "WAREHOUSE MANAGER") {
        const farmers = await farmerModel
          .find({
            supervisor: {$in: (user?.warehouse as any)?.supervisors},
            isApproved: true,
            ...query,
          })
          .populate("field_officer")
          .populate("supervisor")
          .populate("cooperative")
          .populate({
            path: "cooperative",
            populate: {path: "team"},
          })
          .sort({createdAt: -1})
        return res
          .status(200)
          .send({error: false, message: "Success", data: farmers})
      }
      const farmers = await farmerModel
        .find({
          ...query,
          isApproved: true,
        })
        .populate("field_officer")
        .populate("supervisor")
        .populate("cooperative")
        .populate({
          path: "cooperative",
          populate: {path: "team"},
        })
        .sort({createdAt: -1})
      return res
        .status(200)
        .send({error: false, message: "Success", data: farmers})
    }

    if (user?.role === "WAREHOUSE MANAGER") {
      const farmers = await farmerModel
        .find({
          supervisor: {$in: (user?.warehouse as any)?.supervisors},
          isApproved: true,
        })
        .populate("field_officer")
        .populate("supervisor")
        .populate("cooperative")
        .populate({
          path: "cooperative",
          populate: {path: "team"},
        })
        .sort({createdAt: -1})

      return res
        .status(200)
        .send({error: false, message: "Success", data: farmers})
    }
    if (user?.role === "WAREHOUSE ADMIN") {
      const farmers = await farmerModel
        .find({
          supervisor: user?._id,
          isApproved: true,
        })
        .populate("field_officer")
        .populate("supervisor")
        .populate("cooperative")
        .populate({
          path: "cooperative",
          populate: {path: "team"},
        })
        .sort({createdAt: -1})
      return res
        .status(200)
        .send({error: false, message: "Success", data: farmers})
    }
    if (user?.role === "FIELD OFFICER") {
      const farmers = await farmerModel
        .find({
          field_officer: user?._id,
          isApproved: true,
        })
        .populate("field_officer")
        .populate("supervisor")
        .populate("cooperative")
        .populate({
          path: "cooperative",
          populate: {path: "team"},
        })
        .sort({createdAt: -1})
      return res
        .status(200)
        .send({error: false, message: "Success", data: farmers})
    }
    const farmers = await farmerModel
      .find({isApproved: true})
      .populate("field_officer")
      .populate("cooperative")
      .populate("supervisor")
      .populate({
        path: "cooperative",
        populate: {path: "team"},
      })
      .sort({createdAt: -1})
    return res
      .status(200)
      .send({error: false, message: "Success", data: farmers})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const getAllFarmers = async (req: Request, res: Response) => {
  const cuser = await currentUser(req, res)
  const query = req.query
  try {
    const user = await userModel.findById(cuser?.userId).populate("warehouse")
    if (query) {
      if (query.limit) {
        if (user?.role === "WAREHOUSE MANAGER") {
          const farmers = await farmerModel
            .find({
              ...query,
              supervisor: {$in: (user?.warehouse as any)?.supervisors},
            })
            .populate("field_officer")
            .populate("supervisor")
            .populate("cooperative")
            .populate({
              path: "cooperative",
              populate: {path: "team"},
            })
            .limit(Number(query.limit))
            .sort({createdAt: -1})

          return res
            .status(200)
            .send({error: false, message: "Success", data: farmers})
        }
        if (user?.role === "WAREHOUSE ADMIN") {
          const farmers = await farmerModel
            .find({
              ...query,
              supervisor: user?._id,
            })
            .populate("field_officer")
            .populate("supervisor")
            .populate("cooperative")
            .populate({
              path: "cooperative",
              populate: {path: "team"},
            })
            .sort({createdAt: -1})
            .limit(Number(query.limit))
          return res
            .status(200)
            .send({error: false, message: "Success", data: farmers})
        }
        if (user?.role === "FIELD OFFICER") {
          const farmers = await farmerModel
            .find({
              ...query,
              field_officer: user?._id,
            })
            .populate("field_officer")
            .populate("cooperative")
            .populate("supervisor")
            .populate({
              path: "cooperative",
              populate: {path: "team"},
            })
            .sort({createdAt: -1})
            .limit(Number(query.limit))
          return res
            .status(200)
            .send({error: false, message: "Success", data: farmers})
        }
        const farmers = await farmerModel
          .find()
          .populate("field_officer")
          .populate("cooperative")
          .populate("supervisor")
          .populate({
            path: "cooperative",
            populate: {path: "team"},
          })
          .sort({createdAt: -1})
          .limit(Number(query.limit))
        return res
          .status(200)
          .send({error: false, message: "Success", data: farmers})
      }
      if (user?.role === "WAREHOUSE MANAGER") {
        const farmers = await farmerModel
          .find({
            ...query,
            supervisor: {$in: (user?.warehouse as any)?.supervisors},
          })
          .populate("field_officer")
          .populate("supervisor")
          .populate("cooperative")
          .populate({
            path: "cooperative",
            populate: {path: "team"},
          })
          .sort({createdAt: -1})

        return res
          .status(200)
          .send({error: false, message: "Success", data: farmers})
      }
      if (user?.role === "WAREHOUSE ADMIN") {
        const farmers = await farmerModel
          .find({
            ...query,
            supervisor: user?._id,
          })
          .populate("field_officer")
          .populate("supervisor")
          .populate("cooperative")
          .populate({
            path: "cooperative",
            populate: {path: "team"},
          })
          .sort({createdAt: -1})
        return res
          .status(200)
          .send({error: false, message: "Success", data: farmers})
      }
      if (user?.role === "FIELD OFFICER") {
        const farmers = await farmerModel
          .find({
            ...query,
            field_officer: user?._id,
          })
          .populate("field_officer")
          .populate("cooperative")
          .populate("supervisor")
          .populate({
            path: "cooperative",
            populate: {path: "team"},
          })
          .sort({createdAt: -1})
        return res
          .status(200)
          .send({error: false, message: "Success", data: farmers})
      }
    }
    if (user?.role === "WAREHOUSE MANAGER") {
      const farmers = await farmerModel
        .find({
          supervisor: {$in: (user?.warehouse as any)?.supervisors},
        })
        .populate("field_officer")
        .populate("supervisor")
        .populate("cooperative")
        .populate({
          path: "cooperative",
          populate: {path: "team"},
        })
        .sort({createdAt: -1})

      return res
        .status(200)
        .send({error: false, message: "Success", data: farmers})
    }
    if (user?.role === "WAREHOUSE ADMIN") {
      const farmers = await farmerModel
        .find({
          supervisor: user?._id,
        })
        .populate("field_officer")
        .populate("supervisor")
        .populate("cooperative")
        .populate({
          path: "cooperative",
          populate: {path: "team"},
        })
        .sort({createdAt: -1})
      return res
        .status(200)
        .send({error: false, message: "Success", data: farmers})
    }
    if (user?.role === "FIELD OFFICER") {
      const farmers = await farmerModel
        .find({
          field_officer: user?._id,
        })
        .populate("field_officer")
        .populate("supervisor")
        .populate("cooperative")
        .populate({
          path: "cooperative",
          populate: {path: "team"},
        })
        .sort({createdAt: -1})
      return res
        .status(200)
        .send({error: false, message: "Success", data: farmers})
    }

    const farmers = await farmerModel
      .find()
      .populate("field_officer")
      .populate("supervisor")
      .populate("cooperative")
      .populate({
        path: "cooperative",
        populate: {path: "team"},
      })
      .sort({createdAt: -1})
    return res
      .status(200)
      .send({error: false, message: "Success", data: farmers})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const verifiedFarmers = async (req: Request, res: Response) => {
  const user = await currentUser(req, res)
  try {
    if (user?.role === "FIELD OFFICER") {
      const farmers = await farmerModel
        .find({
          field_officer: new mongoose.Types.ObjectId(user?.userId),
          isApproved: true,
        })
        .sort({createdAt: -1})
      return res
        .status(200)
        .send({error: false, message: "Success", data: farmers})
    }
    if (user?.role === "WAREHOUSE ADMIN") {
      const farmers = await farmerModel
        .find({
          supervisor: new mongoose.Types.ObjectId(user?.userId),
          isApproved: true,
        })
        .sort({createdAt: -1})
      return res
        .status(200)
        .send({error: false, message: "Success", data: farmers})
    }
    const farmers = await farmerModel
      .find({isApproved: true})
      .sort({createdAt: -1})
    return res
      .status(200)
      .send({error: false, message: "Success", data: farmers})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}
export const unVerifiedFarmers = async (req: Request, res: Response) => {
  const user = await currentUser(req, res)
  try {
    if (user?.role === "FIELD OFFICER") {
      const farmers = await farmerModel
        .find({
          field_officer: new mongoose.Types.ObjectId(user?.userId),
          isApproved: false,
        })
        .sort({createdAt: -1})
      return res
        .status(200)
        .send({error: false, message: "Success", data: farmers})
    }
    if (user?.role === "WAREHOUSE ADMIN") {
      const farmers = await farmerModel
        .find({
          supervisor: new mongoose.Types.ObjectId(user?.userId),
          isApproved: false,
        })
        .sort({createdAt: -1})
      return res
        .status(200)
        .send({error: false, message: "Success", data: farmers})
    }
    const farmers = await farmerModel
      .find({isApproved: false})
      .sort({createdAt: -1})
    return res
      .status(200)
      .send({error: false, message: "Success", data: farmers})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const updateFarmer = async (req: Request, res: Response) => {
  try {
    const {id} = req.params

    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please pass an ID to query",
      })
    }

    const farmer = await farmerModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!farmer) {
      return res.status(404).send({
        error: true,
        message: "Farmer not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "Farmer updated", data: farmer})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const deleteFarmer = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please pass an ID to query (No ID found)",
      })
    }

    const farmer = await farmerModel.findByIdAndDelete(id)
    if (!farmer) {
      return res.status(404).send({
        error: true,
        message: "Farmer not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "Farmer Deleted", data: farmer})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

// statistics

export const countRegisteredFarmers = async (req: Request, res: Response) => {
  try {
    const user = await currentUser(req, res)
    const cuser = await userModel.findById(user?.userId).populate("warehouse")
    if (user?.role === "FIELD OFFICER") {
      const farmers = await farmerModel
        .find({field_officer: new mongoose.Types.ObjectId(user?.userId)})
        .count()
      return res
        .status(200)
        .send({error: false, message: "Success", data: farmers})
    }
    if (user?.role === "WAREHOUSE ADMIN") {
      const farmers = await farmerModel
        .find({supervisor: new mongoose.Types.ObjectId(user?.userId)})
        .count()
      return res
        .status(200)
        .send({error: false, message: "Success", data: farmers})
    }
    if (user?.role === "WAREHOUSE MANAGER") {
      const farmers = await farmerModel
        .find({supervisor: {$in: (cuser?.warehouse as any)?.supervisors}})
        .count()
      return res
        .status(200)
        .send({error: false, message: "Success", data: farmers})
    }
    const farmers = await farmerModel.find().count()
    return res
      .status(200)
      .send({error: false, message: "Success", data: farmers})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const countVerifiedFarmers = async (req: Request, res: Response) => {
  const user = await currentUser(req, res)
  const cuser = await userModel.findById(user?.userId).populate("warehouse")
  try {
    if (user?.role === "FIELD OFFICER") {
      const farmers = await farmerModel
        .find({
          field_officer: new mongoose.Types.ObjectId(user?.userId),
          isApproved: true,
        })
        .count()
      return res
        .status(200)
        .send({error: false, message: "Success", data: farmers})
    }
    if (user?.role === "WAREHOUSE ADMIN") {
      const farmers = await farmerModel
        .find({
          supervisor: new mongoose.Types.ObjectId(user?.userId),
          isApproved: true,
        })
        .count()
      return res
        .status(200)
        .send({error: false, message: "Success", data: farmers})
    }
    if (user?.role === "WAREHOUSE MANAGER") {
      const farmers = await farmerModel
        .find({
          supervisor: {$in: (cuser?.warehouse as any)?.supervisors},
          isApproved: true,
        })
        .count()
      return res
        .status(200)
        .send({error: false, message: "Success", data: farmers})
    }
    const farmers = await farmerModel.find({isApproved: true}).count()
    return res
      .status(200)
      .send({error: false, message: "Success", data: farmers})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const countUnverifiedFarmers = async (req: Request, res: Response) => {
  const user = await currentUser(req, res)
  try {
    if (user?.role === "FIELD OFFICER") {
      const farmers = await farmerModel
        .find({
          field_officer: new mongoose.Types.ObjectId(user?.userId),
          isApproved: false,
        })
        .count()
      return res
        .status(200)
        .send({error: false, message: "Success", data: farmers})
    }
    if (user?.role === "WAREHOUSE ADMIN") {
      const farmers = await farmerModel
        .find({
          supervisor: new mongoose.Types.ObjectId(user?.userId),
          isApproved: false,
        })
        .count()
      return res
        .status(200)
        .send({error: false, message: "Success", data: farmers})
    }
    const farmers = await farmerModel.find({isApproved: false}).count()
    return res
      .status(200)
      .send({error: false, message: "Success", data: farmers})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const getFeoFarmers = async (req: Request, res: Response) => {
  const user = await currentUser(req, res)
  const {id} = req.params
  try {
    if (user?.role === "WAREHOUSE ADMIN") {
      const farmers = await farmerModel
        .find({supervisor: user?.userId, field_officer: id})
        .populate("field_officer")
        .populate("supervisor")
        .sort({createdAt: -1})

      return res
        .status(200)
        .send({error: false, message: "Success", data: farmers})
    }
    if (user?.role === "FIELD OFFICER") {
      const farmers = await farmerModel
        .find({field_officer: user?.userId})
        .populate("field_officer")
        .populate("supervisor")
        .sort({createdAt: -1})

      return res
        .status(200)
        .send({error: false, message: "Success", data: farmers})
    }
    const farmers = await farmerModel
      .find({field_officer: id})
      .populate("field_officer")
      .populate("supervisor")
      .sort({createdAt: -1})
    return res
      .status(200)
      .send({error: false, message: "Success", data: farmers})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const countFeoFarmers = async (req: Request, res: Response) => {
  const user = await currentUser(req, res)
  const {id} = req.params
  try {
    if (user?.role === "WAREHOUSE ADMIN") {
      const farmers = await farmerModel
        .find({supervisor: user?.userId, field_officer: id})
        .count()
      return res
        .status(200)
        .send({error: false, message: "Success", data: farmers})
    }
    const farmers = await farmerModel.find({field_officer: id}).count()
    return res
      .status(200)
      .send({error: false, message: "Success", data: farmers})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const countFarmers = async (req: Request, res: Response) => {
  const user = await currentUser(req, res)
  const {id} = req.params
  try {
    if (user?.role === "WAREHOUSE ADMIN") {
      const farmers = await farmerModel.find({supervisor: user?.userId}).count()
      return res
        .status(200)
        .send({error: false, message: "Success", data: farmers})
    }
    if (user?.role === "FIELD OFFICER") {
      const farmers = await farmerModel
        .find({field_officer: user?.userId})
        .count()
      return res
        .status(200)
        .send({error: false, message: "Success", data: farmers})
    }
    const farmers = await farmerModel.find().count()
    return res
      .status(200)
      .send({error: false, message: "Success", data: farmers})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}
