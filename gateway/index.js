import express from "express"
import dotenv from "dotenv"
import proxy from "express-http-proxy"
dotenv.config()
import cors from "cors"
import cookieParser from "cookie-parser"
import { getCurrentUser } from "./controllers/user.controller.js"
import protect from "./middleware/auth.middleware.js"
import { proxyWithHeader } from "./utils/proxyWithHeader.js"
import morgan from "morgan"
const port =process.env.PORT

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
app.use("/api/auth",proxy(process.env.AUTH_SERVICE, proxyOptions("Auth")))
app.use("/api/chat",protect,proxyWithHeader(process.env.CHAT_SERVICE, proxyOptions("Chat")))
app.use("/api/agent",protect,proxyWithHeader(process.env.AGENT_SERVICE, proxyOptions("Agent")))
app.use("/api/billing",protect,proxyWithHeader(process.env.BILLING_SERVICE, proxyOptions("Billing")))
app.get("/api/me",protect,getCurrentUser)
app.get("/",(req,res)=>{
    res.json({message:"hello from gateway service"})
})

app.listen(port,()=>{
    console.log(`gateway started at ${port}`)
})
