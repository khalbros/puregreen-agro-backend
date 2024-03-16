import {Router} from "express"
import {
  createStock,
  deleteStock,
  getAllStocks,
  getStock,
  getStocks,
  updateStock,
} from "../controllers/stock.controller"
import {isLoggedIn} from "../middlewares/auth.middleware"

const router: Router = Router()

router.post("/", isLoggedIn, createStock)
router.get("/", isLoggedIn, getAllStocks)
router.get("/names", isLoggedIn, getStocks)
router.get("/:id", isLoggedIn, getStock)
router.patch("/:id", isLoggedIn, updateStock)
router.delete("/:id", isLoggedIn, deleteStock)

export default router
