import {Router} from "express"
import {
  createUser,
  deleteUser,
  getAllFEOs,
  getAllUsers,
  getFEOWithFarmersCount,
  getProfile,
  getUser,
  updateUser,
} from "../controllers/user.controller"
import {isLoggedIn, isSuperAdmin} from "../middlewares/auth.middleware"

const router: Router = Router()

router.post("/", createUser)
router.get("/profile", isLoggedIn, getProfile)
router.get("/", isSuperAdmin, getAllUsers)
router.get("/:id", isSuperAdmin, getUser)
router.patch("/:id", isLoggedIn, updateUser)
router.delete("/:id", isSuperAdmin, deleteUser)
router.get("/feos/all", isLoggedIn, getAllFEOs)
router.get("/feos/withfarmers", isLoggedIn, getFEOWithFarmersCount)

export default router
