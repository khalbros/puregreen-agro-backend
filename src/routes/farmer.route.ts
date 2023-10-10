import {Router} from "express"
import {
  countFeoFarmers,
  countRegisteredFarmers,
  countUnverifiedFarmers,
  countVerifiedFarmers,
  createFarmer,
  deleteFarmer,
  getAllApprovedFarmers,
  getAllFarmers,
  getFarmer,
  updateFarmer,
} from "../controllers/farmer.controller"
import {
  isFieldOfficer,
  isLoggedIn,
  isSupervisorOrFieldOfficer,
} from "../middlewares/auth.middleware"

const router: Router = Router()

router.post("/", isSupervisorOrFieldOfficer, createFarmer)
router.get("/", isLoggedIn, getAllApprovedFarmers)
router.get("/all", isLoggedIn, getAllFarmers)
router.get("/:id", isLoggedIn, getFarmer)
router.patch("/:id", isSupervisorOrFieldOfficer, updateFarmer)
router.delete("/:id", isFieldOfficer, deleteFarmer)
router.get("/count/total_registered", isLoggedIn, countRegisteredFarmers)
router.get("/count/total_verified", isLoggedIn, countVerifiedFarmers)
router.get("/count/total_unverified", isLoggedIn, countUnverifiedFarmers)
router.get("/count/byfeo/:id", isLoggedIn, countFeoFarmers)

export default router
