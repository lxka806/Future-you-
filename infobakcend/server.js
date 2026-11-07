const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const mongoose = require("mongoose")
const reviewRouter = require("./routes/review.route")

dotenv.config()

const app = express()
const port = Number(process.env.PORT) || 3001

const allowedOrigins = new Set(
    (process.env.FRONTEND_ORIGIN || "http://localhost:5173,http://localhost:5174")
        .split(",")
        .map(origin => origin.trim())
        .filter(Boolean)
)

app.use(cors({
    origin: true,
    credentials: true
}))

app.use(express.json({ limit: "10kb" }))
app.use("/api/reviews", reviewRouter)

app.get("/health", (_req, res) => {
    res.status(200).json({
        status: "ok",
        reviewStore: mongoose.connection.readyState === 1 ? "mongodb" : "local-file"
    })
})

const server = app.listen(port, () => {
    console.log(`Info backend listening on port ${port}`)
})

if (process.env.MONGODB_URL) {
    mongoose.connect(process.env.MONGODB_URL, { serverSelectionTimeoutMS: 3000 })
        .then(() => console.log("Review store connected to MongoDB"))
        .catch(error => {
            console.error("Review store is using local-file development storage because MongoDB could not connect:", error.message)
        })
} else if (process.env.NODE_ENV === "production") {
    console.error("MONGODB_URL is required in production; review requests will return 503 until configured")
} else {
    console.warn("MONGODB_URL is not set; reviews will be saved locally in infobakcend/data/reviews.json")
}

const shutdown = async () => {
    server.close()
    await mongoose.disconnect()
}

process.on("SIGINT", shutdown)
process.on("SIGTERM", shutdown)