import "dotenv/config"
import express from "express"
import connectDb from "./config/db.js"
import router from "./routes/auth.route.js"
import cookieParser from "cookie-parser"

const port = parseInt(process.env.PORT || "8001", 10)
if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be a valid number between 1 and 65535")
}

const app = express()
app.set("trust proxy", 1)
app.use(express.json())
app.use(cookieParser())
app.use("/", router)
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" })
})
app.get("/", (req, res) => {
    res.json({ message: "hello from auth" })
})

const startServer = async () => {
    try {
        await connectDb()
        app.listen(port, () => {
            console.log(`auth started at ${port}`)
        })
    } catch (error) {
        console.error("Failed to start auth service:", error)
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
