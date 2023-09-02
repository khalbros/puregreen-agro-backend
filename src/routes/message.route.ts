import {Router} from "express"
import {
  createMessage,
  deleteMessage,
  getAllMessages,
  getMessage,
  getReadMessages,
  getUnReadMessages,
  countReadMessages,
  countUnReadMessages,
} from "../controllers/message.controller"
import {isLoggedIn, isSuperAdminOrAdmin} from "../middlewares/auth.middleware"

const router: Router = Router()

router.post("/", isLoggedIn, createMessage)
router.get("/", isLoggedIn, getAllMessages)
router.get("/:id", isLoggedIn, getMessage)
router.get("/all/read", isLoggedIn, getReadMessages)
router.get("/all/unread", isLoggedIn, getUnReadMessages)
router.get("/count/read", isLoggedIn, countReadMessages)
router.get("/count/unread", isLoggedIn, countUnReadMessages)
router.delete("/:id", isLoggedIn, deleteMessage)

export default router
