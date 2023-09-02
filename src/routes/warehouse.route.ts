import {Router} from "express"
import {
  createWarehouse,
  deleteWarehouse,
  getAllWarehouses,
  getWarehouse,
  updateWarehouse,
} from "../controllers/warehouse.controller"
import {isLoggedIn, isSuperAdmin} from "../middlewares/auth.middleware"

const router: Router = Router()

router.post("/", isSuperAdmin, createWarehouse)
router.get("/", isLoggedIn, getAllWarehouses)
router.get("/:id", isLoggedIn, getWarehouse)
router.patch("/:id", isSuperAdmin, updateWarehouse)
router.delete("/:id", isSuperAdmin, deleteWarehouse)

export default router
