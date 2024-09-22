import {Router} from "express"
import {
  loanDisbursement,
  cashLRP,
  grainLRP,
  deleteDisbursement,
  getAllDisbursements,
  getDisbursement,
  updateDisbursement,
  countDisburseHectares,
  countOutstandinLoan,
  countRecoveredLoan,
  countLoanDisburse,
  countRecoveredNetWeight,
  approveDisbursement,
  countEquity,
  countRecoveredCash,
  countRecoveredGrossWeight,
  deleteCashLRP,
  deleteGrainLRP,
  getAllCashLRP,
  getAllGrainLRP,
  getCashLRP,
  getGrainLRP,
  updateCashLRP,
  updateGrainLRP,
  countRecoveredGrains,
  getRecoveredLoan,
  getOutstandingLoan
} from "../controllers/disburse.controller"
import {isLoggedIn} from "../middlewares/auth.middleware"

const router: Router = Router()

router.post("/loan", isLoggedIn, loanDisbursement)
router.post("/repayment/grain", isLoggedIn, grainLRP)
router.post("/repayment/cash", isLoggedIn, cashLRP)
router.get("/", isLoggedIn, getAllDisbursements)
router.get("/outstanding-loan", isLoggedIn, getOutstandinLoan)
router.get("/recovered-loan", isLoggedIn, getRecoveredLoan)
router.get("/grain", isLoggedIn, getAllGrainLRP)
router.get("/cash", isLoggedIn, getAllCashLRP)
router.get("/grain/:id", isLoggedIn, getGrainLRP)
router.get("/cash/:id", isLoggedIn, getCashLRP)
router.get("/:id", isLoggedIn, getDisbursement)
router.patch("/grain/:id", isLoggedIn, updateGrainLRP)
router.patch("/cash/:id", isLoggedIn, updateCashLRP)
router.patch("/:id", isLoggedIn, updateDisbursement)
router.patch("/approve/:id", isLoggedIn, approveDisbursement)
router.delete("/grain/:id", isLoggedIn, deleteGrainLRP)
router.delete("/cash/:id", isLoggedIn, deleteCashLRP)
router.delete("/:id", isLoggedIn, deleteDisbursement)
router.get("/count/loan-disburse", isLoggedIn, countLoanDisburse)
router.get("/count/hectares-disburse", isLoggedIn, countDisburseHectares)
router.get("/count/equity-disburse", isLoggedIn, countEquity)
router.get("/count/outstanding-loan", isLoggedIn, countOutstandinLoan)
router.get("/count/recovered-loan", isLoggedIn, countRecoveredLoan)
router.get("/count/recovered-grain", isLoggedIn, countRecoveredGrains)
router.get("/count/recovered-cash", isLoggedIn, countRecoveredCash)
router.get("/count/recovered-netweight", isLoggedIn, countRecoveredNetWeight)
router.get(
  "/count/recovered-grossweight",
  isLoggedIn,
  countRecoveredGrossWeight
)

export default router
