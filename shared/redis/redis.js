import "dotenv/config"
import Redis from "ioredis"

const redis = new Redis(process.env.REDIS_URL)

redis.on("connect", () => {
    console.log("redis connected")
})

redis.on("error", (error) => {
    console.error("redis connection error", {
        message: error.message,
        code: error.code
    })
})

redis.on("close", () => {
    console.warn("redis connection closed")
})

export default redis