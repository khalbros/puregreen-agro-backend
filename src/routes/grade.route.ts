import {Router} from "express"
import {
  createGrade,
  deleteGrade,
  getAllGrades,
  getGrade,
  updateGrade,
} from "../controllers/grade.controller"
import {isLoggedIn, isSuperAdminOrAdmin} from "../middlewares/auth.middleware"

const router: Router = Router()

router.post("/", isSuperAdminOrAdmin, createGrade)
router.get("/", isLoggedIn, getAllGrades)
router.get("/:id", isLoggedIn, getGrade)
router.patch("/:id", isSuperAdminOrAdmin, updateGrade)
router.delete("/:id", isSuperAdminOrAdmin, deleteGrade)

export default router
