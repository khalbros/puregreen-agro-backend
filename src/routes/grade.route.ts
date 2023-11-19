import {Router} from "express"
import {
  createGrade,
  deleteGrade,
  getAllGrades,
  getGrade,
  updateGrade,
} from "../controllers/grade.controller"
import {isLoggedIn, isSuperAdmin} from "../middlewares/auth.middleware"

const router: Router = Router()

router.post("/", isSuperAdmin, createGrade)
router.get("/", isLoggedIn, getAllGrades)
router.get("/:id", isLoggedIn, getGrade)
router.patch("/:id", isSuperAdmin, updateGrade)
router.delete("/:id", isSuperAdmin, deleteGrade)

export default router
