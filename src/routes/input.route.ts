import {Router} from "express"
import {
  createInput,
  deleteInput,
  getAllInputs,
  getInput,
  getInputs,
  updateInput,
} from "../controllers/input.controller"
import {isLoggedIn, isSuperAdmin} from "../middlewares/auth.middleware"

const router: Router = Router()

router.post("/", isSuperAdmin, createInput)
router.get("/", isLoggedIn, getAllInputs)
router.get("/names", isLoggedIn, getInputs)
router.get("/:id", isLoggedIn, getInput)
router.patch("/:id", isSuperAdmin, updateInput)
router.delete("/:id", isSuperAdmin, deleteInput)

export default router
