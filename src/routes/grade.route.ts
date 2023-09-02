import {Router} from "express"
import {
  createGrade,
  deleteGrade,
  getAllGrades,
  getGrade,
  updateGrade,
} from "../controllers/grade.controller"
import {isAdmin, isLoggedIn, isSuperAdmin} from "../middlewares/auth.middleware"

const router: Router = Router()

router.post("/", isAdmin, createGrade)
router.get("/", isLoggedIn, getAllGrades)
router.get("/:id", isLoggedIn, getGrade)
router.patch("/:id", isAdmin, updateGrade)
router.delete("/:id", isAdmin, deleteGrade)

export default router
