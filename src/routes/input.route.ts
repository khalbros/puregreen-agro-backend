import {Router} from "express"
import {
  createInput,
  deleteInput,
  getAllInputs,
  getInput,
  getInputs,
  updateInput,
} from "../controllers/input.controller"
import {isAdmin, isLoggedIn, isSuperAdmin} from "../middlewares/auth.middleware"

const router: Router = Router()

router.post("/", isAdmin, createInput)
router.get("/", isLoggedIn, getAllInputs)
router.get("/names", isLoggedIn, getInputs)
router.get("/:id", isLoggedIn, getInput)
router.patch("/:id", isAdmin, updateInput)
router.delete("/:id", isAdmin, deleteInput)

export default router
