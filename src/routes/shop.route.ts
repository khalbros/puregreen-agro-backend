import {Router} from "express"
import {
  createShop,
  deleteShop,
  getAllShops,
  getShop,
  updateShop,
} from "../controllers/shop.controller"
import {isLoggedIn, isSuperAdminOrAdmin} from "../middlewares/auth.middleware"

const router: Router = Router()

router.post("/", isSuperAdminOrAdmin, createShop)
router.get("/", isLoggedIn, getAllShops)
router.get("/:id", isLoggedIn, getShop)
router.patch("/:id", isSuperAdminOrAdmin, updateShop)
router.delete("/:id", isSuperAdminOrAdmin, deleteShop)

export default router
