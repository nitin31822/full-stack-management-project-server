import express from "express"
import http from "http"
import { SocketService } from "./services/socket"

async function init() {
    const app = express()
    const server = http.createServer(app)
    const socketService = new SocketService()

    socketService.io.attach(server)

    const PORT = process.env.PORT ? process.env.PORT : 3002
    socketService.initializeSocketEvents()

    server.listen(PORT , ()=> console.log(`Server listning on PORT : ${PORT}`)  )
}

init()