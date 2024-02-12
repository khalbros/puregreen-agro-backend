import {Router} from "express"
import {
  countFees,
  deletePayment,
  getAllPaidFarmers,
  registrationPayment,
  updatePayment,
} from "../controllers/farmer.controller"
import {
  countEquity,
  deleteEquityPayment,
  equityPayment,
  getEquity,
  updateEquityPayment,
} from "../controllers/equity.controller"
import {isLoggedIn} from "../middlewares/auth.middleware"

const router: Router = Router()

router.post("/registration", isLoggedIn, registrationPayment)
router.get("/registration", isLoggedIn, countFees)
router.get("/list/registration", isLoggedIn, getAllPaidFarmers)
router.patch("/registration/:id", isLoggedIn, updatePayment)
router.delete("/registration/:id", isLoggedIn, deletePayment)

router.post("/equity", isLoggedIn, equityPayment)
router.get("/equity", isLoggedIn, countEquity)
router.get("/list/equity", isLoggedIn, getEquity)
router.patch("/equity/:id", isLoggedIn, updateEquityPayment)
router.delete("/equity/:id", isLoggedIn, deleteEquityPayment)

export default router
