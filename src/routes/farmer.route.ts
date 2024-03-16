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
  unVerifiedFarmers,
  updateFarmer,
  verifiedFarmers,
} from "../controllers/farmer.controller"
import {
  isFieldOfficer,
  isLoggedIn,
  isSupervisorOrFieldOfficer,
} from "../middlewares/auth.middleware"

const router: Router = Router()

router.post("/", isLoggedIn, createFarmer)
router.get("/", isLoggedIn, getAllApprovedFarmers)
router.get("/all", isLoggedIn, getAllFarmers)
router.get("/verified", isLoggedIn, verifiedFarmers)
router.get("/unverified", isLoggedIn, unVerifiedFarmers)
router.get("/:id", isLoggedIn, getFarmer)
router.patch("/:id", isLoggedIn, updateFarmer)
router.delete("/:id", isLoggedIn, deleteFarmer)
router.get("/count/total_registered", isLoggedIn, countRegisteredFarmers)
router.get("/count/total_verified", isLoggedIn, countVerifiedFarmers)
router.get("/count/total_unverified", isLoggedIn, countUnverifiedFarmers)
router.get("/count/byfeo/:id", isLoggedIn, countFeoFarmers)

export default router
