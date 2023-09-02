import {Router} from "express"
import {
  createTransaction,
  deleteTransaction,
  getAllTransactions,
  getTransaction,
  updateTransaction,
} from "../controllers/transaction.controller"
import {
  isWarehouseManager,
  isLoggedIn,
  isSuperAdmin,
} from "../middlewares/auth.middleware"

const router: Router = Router()

router.post("/", isWarehouseManager, createTransaction)
router.get("/", isLoggedIn, getAllTransactions)
router.get("/:id", isLoggedIn, getTransaction)
router.patch("/:id", isLoggedIn, updateTransaction)
router.delete("/:id", isWarehouseManager, deleteTransaction)

export default router
