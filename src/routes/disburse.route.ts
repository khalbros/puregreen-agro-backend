import {Router} from "express"
import {
  loanDisbursement,
  repaymentDisbursement,
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
} from "../controllers/disburse.controller"
import {
  isFieldOfficer,
  isLoggedIn,
  isSupervisor,
  isSupervisorOrWarehouseManager,
  isWarehouseManager,
} from "../middlewares/auth.middleware"

const router: Router = Router()

router.post("/loan", isSupervisor, loanDisbursement)
router.post("/repayment", isWarehouseManager, repaymentDisbursement)
router.get("/", isLoggedIn, getAllDisbursements)
router.get("/:id", isLoggedIn, getDisbursement)
router.patch("/:id", isLoggedIn, updateDisbursement)
router.patch("/approve/:id", isLoggedIn, approveDisbursement)
router.delete("/:id", isLoggedIn, deleteDisbursement)
router.get("/count/loan-disburse", isLoggedIn, countLoanDisburse)
router.get("/count/hectares-disburse", isLoggedIn, countDisburseHectares)
router.get("/count/outstanding-loan", isLoggedIn, countOutstandinLoan)
router.get("/count/recovered-loan", isLoggedIn, countRecoveredLoan)
router.get("/count/recovered-netweight", isLoggedIn, countRecoveredNetWeight)

export default router
