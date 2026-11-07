const goalOptions = require("../data/goalOptions")
const CheckIn = require("../models/checkIn.model")
const Goal = require("../models/goals.model")
const mongoose = require("mongoose")

const editableFields = ["title", "description", "dailyAction", "category", "deadline"]

const isValidGoalId = (id) => mongoose.Types.ObjectId.isValid(id)

const hasValidUser = (req, res) => {
    if (!req.user?.id) {
        res.status(401).json({ message: "Authentication required" })
        return false
    }

    return true
}

const isNonEmptyString = (value) => (
    typeof value === "string" && value.trim().length > 0
)

const isValidDeadline = (value) => {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false
    }

    const date = new Date(`${value}T00:00:00.000Z`)
    return !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
}

const GetGoalOptions = async (req, res) => {
    try {
        return res.status(200).json({ goals: goalOptions })
    } catch (e) {
        console.error(e)
        return res.status(500).json({ message: "Server error" })
    }
}

const ChooseGoals = async (req, res) => {
    try {
        if (!hasValidUser(req, res)) return

        const { goals } = req.body || {}
        if (!Array.isArray(goals) || goals.length === 0) {
            return res.status(400).json({
                message: "Please select at least one goal"
            })
        }

        const newGoals = []
        const selectedGoalKeys = new Set()

        for (const goal of goals) {
            if (!goal || typeof goal !== "object" || Array.isArray(goal)) {
                return res.status(400).json({ message: "Each goal must be an object" })
            }

            if (
                !isNonEmptyString(goal.category) ||
                !isNonEmptyString(goal.title) ||
                !isNonEmptyString(goal.description) ||
                !isNonEmptyString(goal.dailyAction) ||
                !isNonEmptyString(goal.deadline)
            ) {
                return res.status(400).json({
                    message: "Each goal requires a category, title, description, dailyAction, and deadline"
                })
            }

            if (!isValidDeadline(goal.deadline)) {
                return res.status(400).json({
                    message: "Deadline must be a valid date in YYYY-MM-DD format"
                })
            }

            const normalizedGoal = {
                category: goal.category.trim(),
                title: goal.title.trim(),
                description: goal.description.trim(),
                dailyAction: goal.dailyAction.trim(),
                deadline: new Date(`${goal.deadline}T00:00:00.000Z`)
            }

            const supportedCategories = Goal.schema.path("category").enumValues
            if (!supportedCategories.includes(normalizedGoal.category)) {
                return res.status(400).json({
                    message: `The category "${normalizedGoal.category}" is not supported`
                })
            }

            const key = `${normalizedGoal.category.toLowerCase()}:${normalizedGoal.title.toLowerCase()}`
            if (selectedGoalKeys.has(key)) {
                return res.status(409).json({
                    message: `The goal "${normalizedGoal.title}" was selected more than once`
                })
            }
            selectedGoalKeys.add(key)

            newGoals.push({
                user: req.user.id,
                ...normalizedGoal
            })
        }

        const duplicateGoal = await Goal.findOne({
            user: req.user.id,
            $or: newGoals.map(goal => ({
                category: goal.category,
                title: goal.title
            }))
        })

        if (duplicateGoal) {
            return res.status(409).json({
                message: `You have already selected "${duplicateGoal.title}"`
            })
        }

        const savedGoals = await Goal.insertMany(newGoals)
        return res.status(201).json({
            message: "Goals selected successfully",
            goals: savedGoals
        })
    } catch (e) {
        console.error(e)
        return res.status(500).json({ message: "Server error" })
    }
}

const GetMyGoals = async (req, res) => {
    try {
        if (!hasValidUser(req, res)) return

        const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 })
        return res.status(200).json({ goals })
    } catch (e) {
        console.error(e)
        return res.status(500).json({ message: "Server error" })
    }
}

const GetGoalById = async (req, res) => {
    try {
        if (!hasValidUser(req, res)) return
        if (!isValidGoalId(req.params.goalId)) {
            return res.status(400).json({ message: "Invalid goal ID" })
        }

        const goal = await Goal.findOne({
            _id: req.params.goalId,
            user: req.user.id
        })

        if (!goal) {
            return res.status(404).json({ message: "Goal not found" })
        }

        return res.status(200).json({ goal })
    } catch (e) {
        console.error(e)
        return res.status(500).json({ message: "Server error" })
    }
}

const UpdateGoal = async (req, res) => {
    try {
        if (!hasValidUser(req, res)) return
        if (!isValidGoalId(req.params.goalId)) {
            return res.status(400).json({ message: "Invalid goal ID" })
        }
        if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
            return res.status(400).json({ message: "Request body must be an object" })
        }

        const requestedFields = Object.keys(req.body)
        if (requestedFields.some(field => !editableFields.includes(field))) {
            return res.status(400).json({
                message: "Only title, description, dailyAction, category, and deadline can be updated"
            })
        }
        if (requestedFields.length === 0) {
            return res.status(400).json({ message: "Provide at least one field to update" })
        }

        const goal = await Goal.findOne({
            _id: req.params.goalId,
            user: req.user.id
        })
        if (!goal) {
            return res.status(404).json({ message: "Goal not found" })
        }

        for (const field of ["title", "description", "dailyAction"]) {
            if (req.body[field] !== undefined) {
                if (!isNonEmptyString(req.body[field])) {
                    return res.status(400).json({
                        message: `${field} must be a non-empty string`
                    })
                }
                goal[field] = req.body[field].trim()
            }
        }

        if (req.body.category !== undefined) {
            const categories = Goal.schema.path("category").enumValues
            if (
                !isNonEmptyString(req.body.category) ||
                !categories.includes(req.body.category.trim())
            ) {
                return res.status(400).json({ message: "Invalid goal category" })
            }
            goal.category = req.body.category.trim()
        }

        if (req.body.deadline !== undefined) {
            if (!isValidDeadline(req.body.deadline)) {
                return res.status(400).json({
                    message: "Deadline must be a valid date in YYYY-MM-DD format"
                })
            }
            goal.deadline = new Date(`${req.body.deadline}T00:00:00.000Z`)
        }

        const duplicateGoal = await Goal.findOne({
            _id: { $ne: goal._id },
            user: req.user.id,
            category: goal.category,
            title: goal.title
        })
        if (duplicateGoal) {
            return res.status(409).json({
                message: `You already have a goal titled "${goal.title}" in this category`
            })
        }

        await goal.save()
        return res.status(200).json({
            message: "Goal updated successfully",
            goal
        })
    } catch (e) {
        console.error(e)
        return res.status(500).json({ message: "Server error" })
    }
}

const DeleteGoal = async (req, res) => {
    try {
        if (!hasValidUser(req, res)) return
        if (!isValidGoalId(req.params.goalId)) {
            return res.status(400).json({ message: "Invalid goal ID" })
        }

        const goal = await Goal.findOne({
            _id: req.params.goalId,
            user: req.user.id
        })
        if (!goal) {
            return res.status(404).json({ message: "Goal not found" })
        }

        await CheckIn.deleteMany({ goal: goal._id })
        await goal.deleteOne()

        return res.status(200).json({ message: "Goal and daily check-ins deleted successfully" })
    } catch (e) {
        console.error(e)
        return res.status(500).json({ message: "Server error" })
    }
}

const CompleteGoal = async (req, res) => {
    try {
        if (!hasValidUser(req, res)) return
        if (!isValidGoalId(req.params.goalId)) {
            return res.status(400).json({ message: "Invalid goal ID" })
        }

        const goal = await Goal.findOne({
            _id: req.params.goalId,
            user: req.user.id
        })
        if (!goal) {
            return res.status(404).json({ message: "Goal not found" })
        }

        goal.status = "completed"
        goal.progress = 100
        await goal.save()

        return res.status(200).json({
            message: "Goal completed successfully",
            goal
        })
    } catch (e) {
        console.error(e)
        return res.status(500).json({ message: "Server error" })
    }
}

const RestartGoal = async (req, res) => {
    try {
        if (!hasValidUser(req, res)) return
        if (!isValidGoalId(req.params.goalId)) {
            return res.status(400).json({ message: "Invalid goal ID" })
        }

        const goal = await Goal.findOne({
            _id: req.params.goalId,
            user: req.user.id
        })
        if (!goal) {
            return res.status(404).json({ message: "Goal not found" })
        }
        if (goal.status !== "completed") {
            return res.status(400).json({ message: "Only completed goals can be restarted" })
        }

        goal.status = "in-progress"
        goal.progress = 0
        await goal.save()

        return res.status(200).json({
            message: "Goal restarted successfully",
            goal
        })
    } catch (e) {
        console.error(e)
        return res.status(500).json({ message: "Server error" })
    }
}

const GetGoalProgress = async (req, res) => {
    try {
        if (!hasValidUser(req, res)) return
        if (!isValidGoalId(req.params.goalId)) {
            return res.status(400).json({ message: "Invalid goal ID" })
        }

        const goal = await Goal.findOne({
            _id: req.params.goalId,
            user: req.user.id
        }).select("_id progress status")

        if (!goal) {
            return res.status(404).json({ message: "Goal not found" })
        }

        const today = new Date()
        today.setUTCHours(0, 0, 0, 0)
        const dateKey = date => date.toISOString().slice(0, 10)
        const todayKey = dateKey(today)
        const weekDates = []
        for (let offset = 0; offset < 7; offset += 1) {
            const date = new Date(today)
            date.setUTCDate(date.getUTCDate() - offset)
            weekDates.push(dateKey(date))
        }

        const checkIns = await CheckIn.find({
            user: req.user.id,
            goal: goal._id,
            completed: true
        }).select("date -_id").lean()

        const completedDates = new Set(checkIns.map(checkIn => checkIn.date))
        const completedDaysLast7Days = weekDates.filter(date => completedDates.has(date)).length
        const yesterday = new Date(today)
        yesterday.setUTCDate(yesterday.getUTCDate() - 1)

        let streak = 0
        const streakStart = completedDates.has(todayKey) ? today : yesterday
        if (completedDates.has(dateKey(streakStart))) {
            const date = new Date(streakStart)
            while (completedDates.has(dateKey(date))) {
                streak += 1
                date.setUTCDate(date.getUTCDate() - 1)
            }
        }

        return res.status(200).json({
            goalId: goal._id,
            status: goal.status,
            overallProgress: goal.progress,
            dailyConsistency: {
                completedDaysLast7Days,
                totalDays: 7,
                weeklyCompletionPercentage: Math.round((completedDaysLast7Days / 7) * 100)
            },
            streak
        })
    } catch (e) {
        console.error(e)
        return res.status(500).json({ message: "Server error" })
    }
}

module.exports = {
    GetGoalOptions,
    ChooseGoals,
    GetMyGoals,
    GetGoalById,
    UpdateGoal,
    DeleteGoal,
    CompleteGoal,
    RestartGoal,
    GetGoalProgress
}
