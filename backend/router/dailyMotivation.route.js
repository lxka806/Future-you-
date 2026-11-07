const express = require("express")
const protect = require("../middleware/auth.middleware")
const {
    GenerateDailyMotivation,
    GetTodayDailyMotivation,
    GetDailyMotivationHistory,
    GetDailyMotivationById
} = require("../controllers/dailyMotivation.controller")

const dailyMotivationRouter = express.Router()

dailyMotivationRouter.use(protect)
dailyMotivationRouter.post("/generate", GenerateDailyMotivation)
dailyMotivationRouter.get("/today", GetTodayDailyMotivation)
dailyMotivationRouter.get("/", GetDailyMotivationHistory)
dailyMotivationRouter.get("/:motivationId", GetDailyMotivationById)

module.exports = dailyMotivationRouter
