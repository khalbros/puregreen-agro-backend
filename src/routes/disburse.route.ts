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
router.patch("/:id", isSupervisorOrWarehouseManager, updateDisbursement)
router.delete("/:id", isSupervisor, deleteDisbursement)
router.get("/count/loan-disburse", isLoggedIn, countLoanDisburse)
router.get("/count/total-hectares", isLoggedIn, countDisburseHectares)
router.get("/count/total-outstanding", isLoggedIn, countOutstandinLoan)
router.get("/count/total-recovered", isLoggedIn, countRecoveredLoan)

export default router
