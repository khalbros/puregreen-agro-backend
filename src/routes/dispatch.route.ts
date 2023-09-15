import {Router} from "express"
import {
  approveDispatch,
  confirmDispatch,
  createDispatch,
  deleteDispatch,
  getAllDispatches,
  getDispatch,
  updateDispatch,
  veriifyDispatch,
} from "../controllers/dispatch.controller"
import {
  isWarehouseManager,
  isLoggedIn,
  isSuperAdmin,
} from "../middlewares/auth.middleware"

const router: Router = Router()

router.post("/", isWarehouseManager, createDispatch)
router.get("/", isLoggedIn, getAllDispatches)
router.get("/:id", isLoggedIn, getDispatch)
router.patch("/:id", isLoggedIn, updateDispatch)
router.patch("/approve/:id", isSuperAdmin, approveDispatch)
router.patch("/verify/:id", isWarehouseManager, veriifyDispatch)
router.patch("/confirm/:id", isWarehouseManager, confirmDispatch)
router.delete("/:id", isWarehouseManager, deleteDispatch)

export default router
