import {Router} from "express"
import {
  countCooperativeBySupervisor,
  countCooperativeMembers,
  countCooperativies,
  countUnverifiedCooperativies,
  countVerifiedCooperativies,
  createCooperative,
  deleteCooperative,
  getAllApprovedCooperatives,
  getAllCooperatives,
  getCooperative,
  getCooperativeBySupervisor,
  getCooperativeMembers,
  getCooperativeMembersWithCount,
  updateCooperative,
} from "../controllers/cooperative.controller"
import {
  isLoggedIn,
  isSuperAdmin,
  isAdmin,
  isSuperAdminOrAdmin,
} from "../middlewares/auth.middleware"

const router: Router = Router()

router.post("/", isSuperAdminOrAdmin, createCooperative)
router.get("/", isLoggedIn, getAllApprovedCooperatives)
router.get("/get/all", isSuperAdminOrAdmin, getAllCooperatives)
router.get("/:id", isLoggedIn, getCooperative)
router.patch("/:id", isSuperAdminOrAdmin, updateCooperative)
router.delete("/:id", isSuperAdmin, deleteCooperative)
router.get("/count/registered", isLoggedIn, countCooperativies)
router.get("/count/verified", isLoggedIn, countVerifiedCooperativies)
router.get("/count/unverified", isLoggedIn, countUnverifiedCooperativies)

router.get("/members/:id", isLoggedIn, getCooperativeMembers)
router.get("/members-count/:id", isLoggedIn, countCooperativeMembers)
router.get("/get/memberswithcount", isLoggedIn, getCooperativeMembersWithCount)

router.get("/bysupervisor/:id", isLoggedIn, getCooperativeBySupervisor)
router.get("/count/bysupervisor/:id", isLoggedIn, countCooperativeBySupervisor)

export default router
