import "dotenv/config"
import express from "express"
import proxy from "express-http-proxy"
import cors from "cors"
import cookieParser from "cookie-parser"
import { getCurrentUser } from "./controllers/user.controller.js"
import protect from "./middleware/auth.middleware.js"
import { proxyWithHeader } from "./utils/proxyWithHeader.js"
import morgan from "morgan"

const port = parseInt(process.env.PORT || "8000", 10)
if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be a valid number between 1 and 65535")
}

const serviceUrl = (name) => {
    const value = process.env[name]

    if (!value) {
        throw new Error(`${name} is required`)
    }

    let parsedUrl
    try {
        parsedUrl = new URL(value)
    } catch {
        throw new Error(`${name} must be a valid service URL`)
    }

    if (process.env.NODE_ENV === "production" &&
        ["localhost", "127.0.0.1", "::1"].includes(parsedUrl.hostname)) {
        throw new Error(`${name} cannot point to localhost in production`)
    }

    return value.replace(/\/+$/, "")
}

const authService = serviceUrl("AUTH_SERVICE")

const app=express()
app.set("trust proxy", 1)

const proxyOptions = (serviceName) => ({
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers["x-forwarded-proto"] = srcReq.protocol
        proxyReqOpts.headers["x-forwarded-host"] = srcReq.get("host")
        return proxyReqOpts
    },
    proxyErrorHandler: (error, res) => {
        console.error(`${serviceName} proxy error`, {
            code: error.code,
            message: error.message
        })

        if (!res.headersSent) {
            return res.status(error.code === "ETIMEDOUT" ? 504 : 502).json({
                message: `${serviceName} service is unavailable`
            })
        }
    }
})

app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = (process.env.FRONTEND_URL || "")
            .split(",")
            .map((value) => value.trim().replace(/\/+$/, ""))
            .filter(Boolean)
        const requestOrigin = origin?.replace(/\/+$/, "")

        if (!requestOrigin || allowedOrigins.includes(requestOrigin)) {
            return callback(null, true)
        }

        return callback(new Error("Origin is not allowed by CORS"))
    },
    credentials:true
}))
app.use(morgan("dev"))
app.use(cookieParser())
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" })
})
app.use("/api/auth",proxy(authService, proxyOptions("Auth")))
app.use("/api/chat",protect,proxyWithHeader(process.env.CHAT_SERVICE, proxyOptions("Chat")))
app.use("/api/agent",protect,proxyWithHeader(process.env.AGENT_SERVICE, proxyOptions("Agent")))
app.use("/api/billing",protect,proxyWithHeader(process.env.BILLING_SERVICE, proxyOptions("Billing")))
app.get("/api/me",protect,getCurrentUser)
app.get("/",(req,res)=>{
    res.json({message:"hello from gateway service"})
})

app.listen(port, () => {
    console.log(`gateway started at ${port}`)
    startKeepAlivePing()
})

const startKeepAlivePing = () => {
    const servicesToPing = [
        process.env.AUTH_SERVICE,
        process.env.CHAT_SERVICE,
        process.env.AGENT_SERVICE,
        process.env.BILLING_SERVICE,
        process.env.GATEWAY_SERVICE
    ].filter(Boolean)

    if (servicesToPing.length === 0) return

    const PING_INTERVAL = 10 * 60 * 1000 // 10 minutes

    setInterval(() => {
        servicesToPing.forEach(async (baseUrl) => {
            try {
                const url = `${baseUrl.replace(/\/+$/, "")}/health`
                await fetch(url)
            } catch (err) {
                console.error(`Keep-alive ping failed for ${baseUrl}:`, err.message)
            }
        })
    }, PING_INTERVAL)
}

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason)
    process.exit(1)
})

process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error)
    process.exit(1)
})
