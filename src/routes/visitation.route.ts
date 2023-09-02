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

router.post("/", isSupervisor, createVisitation)
router.get("/", isLoggedIn, getAllVisitations)
router.get("/:id", isLoggedIn, getVisitation)
router.patch("/:id", isSupervisor, updateVisitation)
router.delete("/:id", isSupervisor, deleteVisitation)

export default router
