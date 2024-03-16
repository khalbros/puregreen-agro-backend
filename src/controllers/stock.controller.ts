import {Request, Response} from "express"
import {shopModel, stockModel, userModel} from "../models"
import {IStock} from "../types/stock"
import {currentUser, getUserId, getUserRole} from "../utils"

export const createStock = async (req: Request, res: Response) => {
  try {
    const {product, price, quantity, unit, shop}: IStock = req.body

    if (!product || !price || !quantity || !unit || !shop) {
      return res.status(400).send({
        error: true,
        message: "error (some fields are empty / invalid)",
      })
    }
    const productCheck = await stockModel.findOne({
      product: product.toLowerCase(),
      shop,
    })
    if (productCheck)
      return res
        .status(400)
        .send({error: true, message: "product already exist"})

    const newStock = await stockModel.create({
      product: product.toLowerCase(),
      quantity,
      shop: shop.toLowerCase(),
    })

    newStock
      .save()
      .then(
        () => {
          return res
            .status(201)
            .send({error: false, message: "created successfully"})
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

export const getStock = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please set a search key (ID not found)",
      })
    }

    const stock = await stockModel.findById(id).populate("shop")
    if (!stock) {
      return res.status(404).send({
        error: true,
        message: "Product not found",
      })
    }

    return res.status(200).send({error: false, message: "Success", data: stock})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const getAllStocks = async (req: Request, res: Response) => {
  const queries = req.query
  try {
    const userId = await getUserId(req, res)
    const user = await userModel.findById(userId)
    if (queries) {
      if (queries.limit) {
        if (user?.role === "SALES MANAGER") {
          const ushop = await shopModel.findOne({
            sales_manager: {$in: user._id},
          })
          if (!ushop) {
            return res.status(404).send({
              error: true,
              message: "Cant find user shop",
            })
          }
          const stocks = await stockModel
            .find({shop: ushop?._id, ...queries})
            .populate("shop")
            .sort({createdAt: -1})
            .limit(Number(queries.limit))
          if (!stocks) {
            return res.status(404).send({
              error: true,
              message: "Products not found",
            })
          }
          return res
            .status(200)
            .send({error: false, message: "Success", data: stocks})
        }
        const stocks = await stockModel
          .find({...queries})
          .populate("shop", {product: true})
          .sort({createdAt: -1})
          .limit(Number(queries.limit))
        if (!stocks) {
          return res.status(404).send({
            error: true,
            message: "Product not found",
          })
        }
        return res
          .status(200)
          .send({error: false, message: "Success", data: stocks})
      }
      if (user?.role === "SALES MANAGER") {
        const ushop = await shopModel.findOne({sales_manager: {$in: user._id}})
        if (!ushop) {
          return res.status(404).send({
            error: true,
            message: "Cant find user shop",
          })
        }
        const stocks = await stockModel
          .find({shop: ushop?._id, ...queries})
          .populate("shop")
          .sort({createdAt: -1})
        if (!stocks) {
          return res.status(404).send({
            error: true,
            message: "Product not found",
          })
        }
        return res
          .status(200)
          .send({error: false, message: "Success", data: stocks})
      }
      const stocks = await stockModel
        .find({...queries})
        .populate("shop")
        .sort({createdAt: -1})
      if (!stocks) {
        return res.status(404).send({
          error: true,
          message: "Product not found",
        })
      }
      return res
        .status(200)
        .send({error: false, message: "Success", data: stocks})
    }
    if (user?.role === "SALES MANAGER") {
      const ushop = await shopModel.findOne({sales_manager: {$in: user._id}})
      if (!ushop) {
        return res.status(404).send({
          error: true,
          message: "Cant find user shop",
        })
      }
      const stocks = await stockModel
        .find({shop: ushop?._id})
        .populate("shop")
        .sort({createdAt: -1})
      if (!stocks) {
        return res.status(404).send({
          error: true,
          message: "Product not found",
        })
      }
      return res
        .status(200)
        .send({error: false, message: "Success", data: stocks})
    }
    const stocks = await stockModel
      .find()
      .populate("shop", {product: true})
      .sort({createdAt: -1})
    if (!stocks) {
      return res.status(404).send({
        error: true,
        message: "Product not found",
      })
    }
    return res
      .status(200)
      .send({error: false, message: "Success", data: stocks})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const getStocks = async (req: Request, res: Response) => {
  const queries = req.query
  try {
    const userId = await getUserId(req, res)
    const stocks = await stockModel.find().distinct("product")

    if (!stocks) {
      return res.status(404).send({
        error: true,
        message: "Product not found",
      })
    }
    return res
      .status(200)
      .send({error: false, message: "Success", data: stocks})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const updateStock = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please pass an ID to query",
      })
    }

    const stock = await stockModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!stock) {
      return res.status(404).send({
        error: true,
        message: "Product not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "Product updated", data: stock})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}

export const deleteStock = async (req: Request, res: Response) => {
  try {
    const {id} = req.params
    const user_role = await getUserRole(req, res)

    if (!id) {
      return res.status(400).send({
        error: true,
        message: "Error Please pass an ID to query",
      })
    }

    const stock = await stockModel.findByIdAndDelete(id)
    if (!stock) {
      return res.status(404).send({
        error: true,
        message: "Product not found",
      })
    }

    return res
      .status(200)
      .send({error: false, message: "Product Deleted", data: stock})
  } catch (error: any) {
    res.send({error: true, message: error?.message})
  }
}
