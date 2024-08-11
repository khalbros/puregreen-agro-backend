import {Router} from "express"
import {
  createVisitation,
  deleteVisitation,
  getAllVisitations,
  getVisitation,
  updateVisitation,
} from "../controllers/visitation.controller"
import {isAdmin, isLoggedIn, isSupervisor} from "../middlewares/auth.middleware"

const router: Router = Router()

router.post("/", isLoggedIn, createVisitation)
router.get("/", isLoggedIn, getAllVisitations)
router.get("/:id", isLoggedIn, getVisitation)
router.patch("/:id", isLoggedIn, updateVisitation)
router.delete("/:id", isLoggedIn, deleteVisitation)

export default router
