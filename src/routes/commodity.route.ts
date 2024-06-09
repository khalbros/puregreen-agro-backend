import {Router} from "express"
import {
  countCommoditiesOut,
  countCommoditiesReceived,
  countGWByWarehouse,
  countNWByWarehouse,
  createCommodity,
  deleteCommodity,
  deleteCommodityByWarehouse,
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
  isWarehouseManager,
} from "../middlewares/auth.middleware"

const router: Router = Router()

router.post("/", isSuperAdminOrAdmin, createCommodity)
router.get("/", isLoggedIn, getAllApprovedCommodities)
router.get("/all", isSuperAdminOrAdmin, getAllCommodities)
router.get("/:id", isLoggedIn, getCommodity)
router.get("/warehouse/:id", isLoggedIn, getCommodityByWarehouse)
router.delete("/warehouse/:id", isLoggedIn, deleteCommodityByWarehouse)
router.patch("/:id", isSuperAdminOrAdmin, updateCommodity)
router.delete("/:id", isSuperAdmin, deleteCommodity)
router.get("/count/received", isWarehouseManager, countCommoditiesReceived)
router.get("/count/sent", isWarehouseManager, countCommoditiesOut)
router.get("/count/grossweight", isLoggedIn, countGWByWarehouse)
router.get("/count/netweight", isLoggedIn, countNWByWarehouse)

export default router
