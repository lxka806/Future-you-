const mongoose = require("mongoose")
const CheckIn = require("../models/checkIn.model")
const FutureStory = require("../models/futureStory.model")
const Goal = require("../models/goals.model")
const User = require("../models/auth.model")
const { generateFutureStory } = require("../services/ai.service")

const STORY_TITLE = "A Day in the Life of Your Future Self"
const MAX_GOALS_PER_STORY = 25
const GENERATION_COOLDOWN_MS = 5 * 60 * 1000

const hasValidUser = (req, res) => {
    if (!req.user?.id || !mongoose.Types.ObjectId.isValid(req.user.id)) {
        res.status(401).json({ message: "Authentication required" })
        return false
    }

    return true
}

const getDateKey = (value) => {
    if (typeof value !== "string") return null

    const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? new Date(`${value}T00:00:00.000Z`)
        : new Date(value)

    if (Number.isNaN(date.getTime())) return null
    return date.toISOString().slice(0, 10)
}

const getCurrentStreak = (dates, today) => {
    const dateSet = new Set(dates)
    const yesterday = new Date(today)
    yesterday.setUTCDate(yesterday.getUTCDate() - 1)

    const start = dateSet.has(today) ? today : yesterday.toISOString().slice(0, 10)
    if (!dateSet.has(start)) return 0

    const date = new Date(`${start}T00:00:00.000Z`)
    let streak = 0
    while (dateSet.has(date.toISOString().slice(0, 10))) {
        streak += 1
        date.setUTCDate(date.getUTCDate() - 1)
    }
    return streak
}

const buildProgressContext = (goals, checkInHistory) => {
    const todayDate = new Date()
    todayDate.setUTCHours(0, 0, 0, 0)
    const today = todayDate.toISOString().slice(0, 10)
    const weekStart = new Date(todayDate)
    weekStart.setUTCDate(weekStart.getUTCDate() - 6)
    const monthStart = new Date(todayDate)
    monthStart.setUTCDate(monthStart.getUTCDate() - 29)
    const weekStartKey = weekStart.toISOString().slice(0, 10)
    const monthStartKey = monthStart.toISOString().slice(0, 10)

    const historyByGoal = new Map()
    const allCompletedDates = new Set()
    for (const history of checkInHistory) {
        const dates = history.dates
            .map(getDateKey)
            .filter(Boolean)
        historyByGoal.set(String(history._id), new Set(dates))
        dates.forEach(date => allCompletedDates.add(date))
    }

    const goalsWithProgress = goals.map(goal => {
        const dates = historyByGoal.get(String(goal._id)) || new Set()
        const recentDates = [...dates]
            .filter(date => date >= monthStartKey && date <= today)
            .sort()

        return {
            id: String(goal._id),
            category: goal.category,
            title: goal.title,
            description: goal.description,
            dailyAction: goal.dailyAction,
            deadline: goal.deadline || null,
            status: goal.status,
            progressPercent: goal.progress,
            completedCheckInDaysLast7Days: [...dates].filter(
                date => date >= weekStartKey && date <= today
            ).length,
            completedCheckInDaysLast30Days: recentDates.length,
            currentStreakDays: getCurrentStreak([...dates], today),
            recentCompletedDates: recentDates
        }
    })

    const completedDaysLast7Days = [...allCompletedDates].filter(
        date => date >= weekStartKey && date <= today
    ).length
    const completedDaysLast30Days = [...allCompletedDates].filter(
        date => date >= monthStartKey && date <= today
    ).length

    return {
        asOfDate: today,
        goals: goalsWithProgress,
        overallConsistency: {
            completedDaysLast7Days,
            weeklyCompletionPercentage: Math.round((completedDaysLast7Days / 7) * 100),
            completedDaysLast30Days,
            currentStreakDays: getCurrentStreak([...allCompletedDates], today)
        }
    }
}

const GenerateFutureStory = async (req, res) => {
    try {
        if (!hasValidUser(req, res)) return

        const [user, goals] = await Promise.all([
            User.findById(req.user.id).select("username"),
            Goal.find({ user: req.user.id })
                .select("category title description dailyAction deadline status progress")
                .sort({ createdAt: 1 })
        ])

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        if (goals.length === 0) {
            return res.status(400).json({
                message: "Choose at least one goal before generating a future story"
            })
        }
        if (goals.length > MAX_GOALS_PER_STORY) {
            return res.status(400).json({
                message: `A story can include up to ${MAX_GOALS_PER_STORY} goals`
            })
        }

        const cooldownStart = new Date(Date.now() - GENERATION_COOLDOWN_MS)
        const recentStory = await FutureStory.findOne({
            user: req.user.id,
            generatedAt: { $gte: cooldownStart }
        }).select("generatedAt")

        if (recentStory) {
            const retryAfterSeconds = Math.ceil(
                (GENERATION_COOLDOWN_MS - (Date.now() - recentStory.generatedAt.getTime())) / 1000
            )
            return res.status(429).json({
                message: "Please wait before generating another future story",
                retryAfterSeconds
            })
        }

        const goalIds = goals.map(goal => goal._id)
        const checkInHistory = await CheckIn.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(req.user.id),
                    goal: { $in: goalIds },
                    completed: true
                }
            },
            {
                $group: {
                    _id: { goal: "$goal", date: "$date" }
                }
            },
            {
                $group: {
                    _id: "$_id.goal",
                    dates: { $push: "$_id.date" }
                }
            }
        ])

        const progressContext = buildProgressContext(goals, checkInHistory)
        const content = await generateFutureStory({
            username: user.username,
            progress: progressContext
        })

        const story = await FutureStory.create({
            user: req.user.id,
            title: STORY_TITLE,
            content,
            goalsUsed: goalIds
        })

        return res.status(201).json({
            message: "Future story generated successfully",
            story
        })
    } catch (e) {
        console.error(e)
        const statusCode = e.statusCode || 500
        return res.status(statusCode).json({
            message: statusCode === 500 ? "Server error" : e.message
        })
    }
}

const GetFutureStories = async (req, res) => {
    try {
        if (!hasValidUser(req, res)) return

        const stories = await FutureStory.find({ user: req.user.id })
            .select("title generatedAt goalsUsed")
            .sort({ generatedAt: -1 })
        return res.status(200).json({ stories })
    } catch (e) {
        console.error(e)
        return res.status(500).json({ message: "Server error" })
    }
}

const GetFutureStoryById = async (req, res) => {
    try {
        if (!hasValidUser(req, res)) return
        if (!mongoose.Types.ObjectId.isValid(req.params.storyId)) {
            return res.status(400).json({ message: "Invalid story ID" })
        }

        const story = await FutureStory.findOne({
            _id: req.params.storyId,
            user: req.user.id
        })
        if (!story) {
            return res.status(404).json({ message: "Future story not found" })
        }

        return res.status(200).json({ story })
    } catch (e) {
        console.error(e)
        return res.status(500).json({ message: "Server error" })
    }
}

const DeleteFutureStory = async (req, res) => {
    try {
        if (!hasValidUser(req, res)) return
        if (!mongoose.Types.ObjectId.isValid(req.params.storyId)) {
            return res.status(400).json({ message: "Invalid story ID" })
        }

        const story = await FutureStory.findOneAndDelete({
            _id: req.params.storyId,
            user: req.user.id
        })
        if (!story) {
            return res.status(404).json({ message: "Future story not found" })
        }

        return res.status(200).json({ message: "Future story deleted successfully" })
    } catch (e) {
        console.error(e)
        return res.status(500).json({ message: "Server error" })
    }
}

module.exports = {
    GenerateFutureStory,
    GetFutureStories,
    GetFutureStoryById,
    DeleteFutureStory
}
