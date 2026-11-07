const express = require("express")
const dotenv = require("dotenv")
dotenv.config()
const mongoose = require("mongoose")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const PORT = process.env.PORT
const app = express()
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

const MONGODB_URL = process.env.MONGODB_URL

const authRouter = require("./router/auth.route")
const goalRouter = require("./router/goal.route")
const futureStoryRouter = require("./router/futureStory.route")
const dailyMotivationRouter = require("./router/dailyMotivation.route")
const checkInRouter = require("./router/checkIn.route")
const journalRouter = require("./router/journal.route")

// Increase the limit to 10MB (or 5mb depending on your needs)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))
app.use(cookieParser())

app.use("/api/auth", authRouter)
app.use("/api/goals", goalRouter)
app.use("/api/future-stories", futureStoryRouter)
app.use("/api/daily-motivation", dailyMotivationRouter)
app.use("/api/check-ins", checkInRouter)
app.use("/api/journal", journalRouter)

mongoose.connect(MONGODB_URL)
    .then(() => {
        console.log("Connected to MongoDB")

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
        })
    })