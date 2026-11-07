const mongoose = require("mongoose")
const CheckIn = require("../models/checkIn.model")
const DailyMotivation = require("../models/dailyMotivation.model")
const Goal = require("../models/goals.model")
const User = require("../models/auth.model")
const { generateDailyMotivation } = require("../services/ai.service")

const MAX_GOALS_PER_MESSAGE = 25
const HISTORY_LIMIT = 30

const hasValidUser = (req, res) => {
    if (!req.user?.id || !mongoose.Types.ObjectId.isValid(req.user.id)) {
        res.status(401).json({ message: "Authentication required" })
        return false
    }

    return true
}

const getTodayDateKey = () => new Date().toISOString().slice(0, 10)

const GenerateDailyMotivation = async (req, res) => {
    try {
        if (!hasValidUser(req, res)) return

        const today = getTodayDateKey()
        const existingMotivation = await DailyMotivation.findOne({
            user: req.user.id,
            date: today
        })

        if (existingMotivation) {
            return res.status(200).json({
                message: "Today's motivation has already been generated",
                motivation: existingMotivation
            })
        }

        const [user, goals] = await Promise.all([
            User.findById(req.user.id).select("username"),
            Goal.find({ user: req.user.id })
                .select("category title description dailyAction status progress")
                .sort({ createdAt: 1 })
                .limit(MAX_GOALS_PER_MESSAGE + 1)
        ])

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        if (goals.length === 0) {
            return res.status(400).json({
                message: "Choose at least one goal before generating daily motivation"
            })
        }
        if (goals.length > MAX_GOALS_PER_MESSAGE) {
            return res.status(400).json({
                message: `Daily motivation can include up to ${MAX_GOALS_PER_MESSAGE} goals`
            })
        }

        const todayDate = new Date(`${today}T00:00:00.000Z`)
        const weekStartDate = new Date(todayDate)
        weekStartDate.setUTCDate(weekStartDate.getUTCDate() - 6)
        const weekStart = weekStartDate.toISOString().slice(0, 10)
        const goalIds = goals.map(goal => goal._id)

        const checkIns = await CheckIn.find({
            user: req.user.id,
            goal: { $in: goalIds },
            completed: true,
            date: { $gte: weekStart, $lte: today }
        }).select("goal date -_id").lean()

        const checkInsByGoal = new Map()
        for (const checkIn of checkIns) {
            const goalId = String(checkIn.goal)
            if (!checkInsByGoal.has(goalId)) checkInsByGoal.set(goalId, new Set())
            checkInsByGoal.get(goalId).add(checkIn.date)
        }

        const progress = {
            asOfDate: today,
            periodDays: 7,
            goals: goals.map(goal => {
                const completedDates = [
                    ...(checkInsByGoal.get(String(goal._id)) || new Set())
                ].sort()

                return {
                    id: String(goal._id),
                    category: goal.category,
                    title: goal.title,
                    description: goal.description,
                    dailyAction: goal.dailyAction,
                    status: goal.status,
                    progressPercent: goal.progress,
                    completedCheckInDaysLast7Days: completedDates.length,
                    recentCompletedDates: completedDates
                }
            })
        }

        const content = await generateDailyMotivation({
            username: user.username,
            progress
        })

        try {
            const motivation = await DailyMotivation.create({
                user: req.user.id,
                date: today,
                content,
                goalsUsed: goalIds
            })

            return res.status(201).json({
                message: "Daily motivation generated successfully",
                motivation
            })
        } catch (e) {
            if (e.code !== 11000) throw e

            const motivation = await DailyMotivation.findOne({
                user: req.user.id,
                date: today
            })
            if (!motivation) throw e

            return res.status(200).json({
                message: "Today's motivation has already been generated",
                motivation
            })
        }
    } catch (e) {
        console.error(e)
        const statusCode = e.statusCode || 500
        return res.status(statusCode).json({
            message: statusCode === 500 ? "Server error" : e.message
        })
    }
}

const GetTodayDailyMotivation = async (req, res) => {
    try {
        if (!hasValidUser(req, res)) return

        const motivation = await DailyMotivation.findOne({
            user: req.user.id,
            date: getTodayDateKey()
        })
        if (!motivation) {
            return res.status(404).json({ message: "Today's motivation has not been generated" })
        }

        return res.status(200).json({ motivation })
    } catch (e) {
        console.error(e)
        return res.status(500).json({ message: "Server error" })
    }
}

const GetDailyMotivationHistory = async (req, res) => {
    try {
        if (!hasValidUser(req, res)) return

        const motivations = await DailyMotivation.find({ user: req.user.id })
            .sort({ generatedAt: -1 })
            .limit(HISTORY_LIMIT)
        return res.status(200).json({ motivations })
    } catch (e) {
        console.error(e)
        return res.status(500).json({ message: "Server error" })
    }
}

const GetDailyMotivationById = async (req, res) => {
    try {
        if (!hasValidUser(req, res)) return
        if (!mongoose.Types.ObjectId.isValid(req.params.motivationId)) {
            return res.status(400).json({ message: "Invalid motivation ID" })
        }

        const motivation = await DailyMotivation.findOne({
            _id: req.params.motivationId,
            user: req.user.id
        })
        if (!motivation) {
            return res.status(404).json({ message: "Daily motivation not found" })
        }

        return res.status(200).json({ motivation })
    } catch (e) {
        console.error(e)
        return res.status(500).json({ message: "Server error" })
    }
}

module.exports = {
    GenerateDailyMotivation,
    GetTodayDailyMotivation,
    GetDailyMotivationHistory,
    GetDailyMotivationById
}
