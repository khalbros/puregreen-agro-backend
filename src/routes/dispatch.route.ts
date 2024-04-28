import {Router} from "express"
import {
  approveDispatch,
  confirmDispatch,
  countDispatchBagsReceive,
  countDispatchBagsSent,
  createDispatch,
  deleteDispatch,
  getAllDispatches,
  getDispatch,
  getItems,
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
router.get("/items/:id", isLoggedIn, getItems)
router.get("/:id", isLoggedIn, getDispatch)
router.patch("/:id", isLoggedIn, updateDispatch)
router.patch("/approve/:id", isSuperAdmin, approveDispatch)
router.patch("/verify/:id", isWarehouseManager, veriifyDispatch)
router.patch("/confirm/:id", isWarehouseManager, confirmDispatch)
router.delete("/:id", isWarehouseManager, deleteDispatch)
router.get("/count/bags-sent", isWarehouseManager, countDispatchBagsSent)
router.get("/count/bags-receive", isWarehouseManager, countDispatchBagsReceive)

export default router
