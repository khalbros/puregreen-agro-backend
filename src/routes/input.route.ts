import {Router} from "express"
import {
  ApproveInput,
  createInput,
  deleteInput,
  getAllApprovedInputs,
  getAllInputs,
  getInput,
  getInputs,
  updateInput,
} from "../controllers/input.controller"
import {isLoggedIn, isSuperAdminOrAdmin} from "../middlewares/auth.middleware"

const router: Router = Router()

router.post("/", isLoggedIn, createInput)
router.get("/", isLoggedIn, getAllInputs)
router.get("/approved", isLoggedIn, getAllApprovedInputs)
router.get("/names", isLoggedIn, getInputs)
router.get("/:id", isLoggedIn, getInput)
router.patch("/:id", isLoggedIn, updateInput)
router.patch("/approve/:id", isLoggedIn, ApproveInput)
router.delete("/:id", isLoggedIn, deleteInput)

export default router
