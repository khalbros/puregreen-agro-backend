import {Router} from "express"
import {
  createProject,
  deleteProject,
  getAllProjects,
  getProject,
  updateProject,
} from "../controllers/project.controller"
import {isLoggedIn, isSuperAdminOrAdmin} from "../middlewares/auth.middleware"

const router: Router = Router()

router.post("/", isSuperAdminOrAdmin, createProject)
router.get("/", isLoggedIn, getAllProjects)
router.get("/:id", isLoggedIn, getProject)
router.patch("/:id", isSuperAdminOrAdmin, updateProject)
router.delete("/:id", isSuperAdminOrAdmin, deleteProject)

export default router
