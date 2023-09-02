import {Router} from "express"
import {
  createCommodity,
  deleteCommodity,
  getAllApprovedCommodities,
  getAllCommodities,
  getCommodity,
  getCommodityByWarehouse,
  updateCommodity,
} from "../controllers/commodity.controller"
import {
  isAdmin,
  isLoggedIn,
  isSuperAdmin,
  isSuperAdminOrAdmin,
} from "../middlewares/auth.middleware"

const router: Router = Router()

router.post("/", isSuperAdminOrAdmin, createCommodity)
router.get("/", isLoggedIn, getAllApprovedCommodities)
router.get("/all", isSuperAdminOrAdmin, getAllCommodities)
router.get("/:id", isLoggedIn, getCommodity)
router.get("/warehouse/:id", isLoggedIn, getCommodityByWarehouse)
router.patch("/:id", isSuperAdminOrAdmin, updateCommodity)
router.delete("/:id", isSuperAdmin, deleteCommodity)

export default router
