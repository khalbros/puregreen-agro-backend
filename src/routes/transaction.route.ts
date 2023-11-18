import {Router} from "express"
import {approveTransaction} from "../controllers/transaction.controller"
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
  isSuperAdminOrAdmin,
} from "../middlewares/auth.middleware"

const router: Router = Router()

router.post("/", isWarehouseManager, createTransaction)
router.get("/", isLoggedIn, getAllTransactions)
router.get("/:id", isLoggedIn, getTransaction)
router.patch("/:id", isLoggedIn, updateTransaction)
router.patch("/approve/:id", isLoggedIn, approveTransaction)
router.delete("/:id", isSuperAdminOrAdmin, deleteTransaction)

export default router
