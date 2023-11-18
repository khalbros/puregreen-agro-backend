import {Router} from "express"
import {
  login,
  changePassword,
  forgotPassword,
  resetPassword,
  logout,
  verifyOtp,
  resetManual,
} from "../controllers/auth.controller"
import {isLoggedIn} from "../middlewares/auth.middleware"

const router: Router = Router()

router.post("/login", login)

router.post("/forgot-password", forgotPassword)

router.post("/change-password", isLoggedIn, changePassword)

router.post("/reset-password", resetPassword)
router.post("/reset-manual", resetManual)
router.post("/verify-otp", verifyOtp)

router.post("/logout", isLoggedIn, logout)

export default router
