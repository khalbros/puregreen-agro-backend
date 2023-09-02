import {Request, Response} from "express"
import {messageModel} from "../models"
import {getUserId, getUserRole} from "../utils"
import {IMessage} from "../types/message"

export const createMessage = async (req: Request, res: Response) => {
  try {
    const {message, from, to}: IMessage = req.body

    if (!message) {
      return res.status(400).send({
        error: true,
        message: "messages field empty",
      })
    }
    if (!from) {
      return res.status(400).send({
        error: true,
        message: "messages sender id empty",
      })
    }
    if (!to) {
      return res.status(400).send({
        error: true,
        message: "messages receiver id empty",
      })
    }

    const newMessage = await messageModel.create(req.body)

    newMessage
      .save()
      .then(
        () => {
          return res.status(201).send({
            error: false,
            message: "message created successfully",
            data: newMessage,
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

export const getMessage = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please set a search key (ID not found)",
      })
    }

    const message = await messageModel
      .findById(id)
      .populate("from")
      .populate("to")
    if (!message) {
      return res.status(404).send({
        error: true,
        message: "Message not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "Success", data: message})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const getAllMessages = async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req, res)
    const messages = await messageModel
      .find({$or: [{to: userId}, {from: userId}]})
      .populate("from")
      .populate("to")
    if (!messages) {
      return res.status(404).send({
        error: true,
        message: "Message not found",
      })
    }
    return res
      .status(200)
      .send({error: false, message: "Success", data: messages})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const getReadMessages = async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req, res)
    const messages = await messageModel
      .find({isRead: true, $or: [{to: userId}, {from: userId}]})
      .populate("from")
      .populate("to")
    if (!messages) {
      return res.status(404).send({
        error: true,
        message: "Message not found",
      })
    }
    return res
      .status(200)
      .send({error: false, message: "Success", data: messages})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const getUnReadMessages = async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req, res)
    const messages = await messageModel
      .find({isRead: false, $or: [{to: userId}, {from: userId}]})
      .populate("from")
      .populate("to")
    if (!messages) {
      return res.status(404).send({
        error: true,
        message: "Message not found",
      })
    }
    return res
      .status(200)
      .send({error: false, message: "Success", data: messages})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const countReadMessages = async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req, res)
    const messages = await messageModel
      .find({isRead: true, $or: [{to: userId}, {from: userId}]})
      .count()
    if (!messages) {
      return res.status(404).send({
        error: true,
        message: "Message not found",
      })
    }
    return res
      .status(200)
      .send({error: false, message: "Success", data: messages})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}
export const countUnReadMessages = async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req, res)
    const messages = await messageModel
      .find({isRead: false, $or: [{to: userId}, {from: userId}]})
      .count()
    if (!messages) {
      return res.status(404).send({
        error: true,
        message: "Message not found",
      })
    }
    return res
      .status(200)
      .send({error: false, message: "Success", data: messages})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    const user_role = await getUserRole(req, res)

    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please pass an ID to query",
      })
    }

    const message = await messageModel.findByIdAndDelete(id)
    if (!message) {
      return res.status(404).send({
        error: true,
        message: "Message not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "Message Deleted", data: message})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}
