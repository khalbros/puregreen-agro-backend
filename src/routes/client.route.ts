import {Router} from "express"
import {
  createClient,
  deleteClient,
  getAllClients,
  getClient,
  updateClient,
} from "../controllers/client.controller"
import {isLoggedIn, isWarehouseManager} from "../middlewares/auth.middleware"

const router: Router = Router()

router.post("/", isWarehouseManager, createClient)
router.get("/", isLoggedIn, getAllClients)
router.get("/:id", isWarehouseManager, getClient)
router.patch("/:id", isWarehouseManager, updateClient)
router.delete("/:id", isWarehouseManager, deleteClient)

export default router
