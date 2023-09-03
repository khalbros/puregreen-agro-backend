import express, {Application, Request, Response} from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import authRouter from "./routes/auth.route"
import userRouter from "./routes/user.route"
import warehouseRouter from "./routes/warehouse.route"
import cooperativeRouter from "./routes/cooperative.route"
import inputRouter from "./routes/input.route"
import bundleRouter from "./routes/bundle.route"
import gradeRouter from "./routes/grade.route"
import commodityRouter from "./routes/commodity.route"
import clientRouter from "./routes/client.route"
import dispatchRouter from "./routes/dispatch.route"
import transactionRouter from "./routes/transaction.route"
import farmerRouter from "./routes/farmer.route"
import projectRouter from "./routes/project.route"
import teamRouter from "./routes/team.route"
import visitationRouter from "./routes/visitation.route"
import disbursementRouter from "./routes/disburse.route"
import fileUploader from "express-fileupload"
const app: Application = express()

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://192.168.43.69:19000",
      "https://puregreen-agrochemicals.onrender.com",
    ],
    credentials: true,
  })
)
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())
app.use(fileUploader())
app.use("/api/auth", authRouter)
app.use("/api/users", userRouter)
app.use("/api/warehouse", warehouseRouter)
app.use("/api/cooperative", cooperativeRouter)
app.use("/api/input", inputRouter)
app.use("/api/bundle", bundleRouter)
app.use("/api/grade", gradeRouter)
app.use("/api/commodity", commodityRouter)
app.use("/api/client", clientRouter)
app.use("/api/dispatch", dispatchRouter)
app.use("/api/transaction", transactionRouter)
app.use("/api/farmer", farmerRouter)
app.use("/api/disbursement", disbursementRouter)
app.use("/api/project", projectRouter)
app.use("/api/team", teamRouter)
app.use("/api/visitation", visitationRouter)

app.use("/uploads", express.static("uploads"))
app.get("/*", (req: Request, res: Response) => res.send("Hello World"))

export default app
