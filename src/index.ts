import "dotenv/config"
import http from "http"
import mongoose from "mongoose"
import app from "./app"
import {Server, Socket} from "socket.io"

const PORT = process.env.PORT!
const DB_URL = process.env.DB_URL!

const server = http.createServer(app)
export const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
})

export const activeSockets: Record<string, Socket> = {}

mongoose.set("strictQuery", true)
mongoose
  .connect(DB_URL, {autoIndex: false})
  .then(
    () => {
      console.log("DataBase Connected")
      server.listen(PORT, () => console.log(`Server Running On Port: ${PORT}`))
    },
    (error) => console.log(error.message)
  )
  .catch((error) => console.log(error.message))

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId as string

  if (userId) {
    activeSockets[userId] = socket
  }

  socket.on("disconnect", () => {
    delete activeSockets[userId]
  })
})
