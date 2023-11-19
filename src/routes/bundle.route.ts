import {Router} from "express"
import {
  createBundle,
  deleteBundle,
  getAllBundles,
  getBundle,
  updateBundle,
} from "../controllers/bundle.controller"
import {isSuperAdminOrAdmin, isLoggedIn} from "../middlewares/auth.middleware"

const router: Router = Router()

router.post("/", isSuperAdminOrAdmin, createBundle)
router.get("/", isLoggedIn, getAllBundles)
router.get("/:id", isLoggedIn, getBundle)
router.patch("/:id", isSuperAdminOrAdmin, updateBundle)
router.delete("/:id", isSuperAdminOrAdmin, deleteBundle)

export default router
