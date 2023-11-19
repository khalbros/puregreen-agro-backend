import {Router} from "express"
import {
  createInput,
  deleteInput,
  getAllInputs,
  getInput,
  getInputs,
  updateInput,
} from "../controllers/input.controller"
import {isLoggedIn, isSuperAdminOrAdmin} from "../middlewares/auth.middleware"

const router: Router = Router()

router.post("/", isSuperAdminOrAdmin, createInput)
router.get("/", isLoggedIn, getAllInputs)
router.get("/names", isLoggedIn, getInputs)
router.get("/:id", isLoggedIn, getInput)
router.patch("/:id", isSuperAdminOrAdmin, updateInput)
router.delete("/:id", isSuperAdminOrAdmin, deleteInput)

export default router
