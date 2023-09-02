import {Router} from "express"
import {
  createTeam,
  deleteTeam,
  getAllTeams,
  getTeam,
  updateTeam,
} from "../controllers/team.controller"
import {isLoggedIn, isSuperAdminOrAdmin} from "../middlewares/auth.middleware"

const router: Router = Router()

router.post("/", isSuperAdminOrAdmin, createTeam)
router.get("/", isLoggedIn, getAllTeams)
router.get("/:id", isLoggedIn, getTeam)
router.patch("/:id", isSuperAdminOrAdmin, updateTeam)
router.delete("/:id", isSuperAdminOrAdmin, deleteTeam)

export default router
