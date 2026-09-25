import "dotenv/config"
import express from "express"
import connectDb from "./config/db.js"
import router from "./routes/chat.routes.js"

const port = parseInt(process.env.PORT || "8002", 10)
if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be a valid number between 1 and 65535")
}

const app = express()
app.use(express.json())
app.use("/", router)
app.get("/", (req, res) => {
    res.json({ message: "hello from chat" })
})

const startServer = async () => {
    try {
        await connectDb()
        app.listen(port, () => {
            console.log(`chat started at ${port}`)
        })
    } catch (error) {
        console.error("Failed to start chat service:", error)
        process.exit(1)
    }
}

startServer()

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason)
    process.exit(1)
})

process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error)
    process.exit(1)
})
