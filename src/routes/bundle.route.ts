import {Router} from "express"
import {
  createBundle,
  deleteBundle,
  getAllBundles,
  getBundle,
  updateBundle,
} from "../controllers/bundle.controller"
import {isAdmin, isLoggedIn, isSuperAdmin} from "../middlewares/auth.middleware"

const router: Router = Router()

router.post("/", isAdmin, createBundle)
router.get("/", isLoggedIn, getAllBundles)
router.get("/:id", isLoggedIn, getBundle)
router.patch("/:id", isAdmin, updateBundle)
router.delete("/:id", isAdmin, deleteBundle)

export default router
