import "dotenv/config"
import express from "express"
import connectDb from "./config/db.js"
import router from "./routes/agent.route.js"

const port = parseInt(process.env.PORT || "8003", 10)
if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be a valid number between 1 and 65535")
}

const app = express()

app.use(express.json())
app.use("/", router)

app.use((err, req, res, next) => {
    console.error("Error:", err)

    if (err.status) {
        return res.status(err.status).json(err.data)
    }

    return res.status(500).json({ message: `agent error ${err.message || err}` })
})

app.get("/", (req, res) => {
    res.json({ message: "hello from agent" })
})

const startServer = async () => {
    try {
        await connectDb()
        app.listen(port, () => {
            console.log(`agent started at ${port}`)
        })
    } catch (error) {
        console.error("Failed to start agent service:", error)
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
