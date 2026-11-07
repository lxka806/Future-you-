const mongoose = require("mongoose")
const CheckIn = require("../models/checkIn.model")
const Goal = require("../models/goals.model")

const isValidDate = value => {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false
    }

    const date = new Date(`${value}T00:00:00.000Z`)
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

const getCheckIns = async (req, res) => {
    try {
        const today = new Date().toISOString().slice(0, 10)
        const from = req.query.from || today
        const to = req.query.to || today

        if (!isValidDate(from) || !isValidDate(to) || from > to || to > today) {
            return res.status(400).json({ message: "Provide a valid date range ending today or earlier" })
        }

        const checkIns = await CheckIn.find({
            user: req.user.id,
            completed: true,
            date: { $gte: from, $lte: to }
        })
            .populate("goal", "category title dailyAction")
            .sort({ date: 1, createdAt: 1 })

        return res.status(200).json({ checkIns })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Failed to load habit check-ins" })
    }
}

const saveCheckIn = async (req, res) => {
    try {
        const { goalId, date } = req.body || {}
        const completed = req.body?.completed

        if (!mongoose.Types.ObjectId.isValid(goalId)) {
            return res.status(400).json({ message: "A valid goalId is required" })
        }
        if (!isValidDate(date) || date > new Date().toISOString().slice(0, 10)) {
            return res.status(400).json({ message: "Date must be a valid date no later than today" })
        }
        if (typeof completed !== "boolean") {
            return res.status(400).json({ message: "completed must be true or false" })
        }

        const goal = await Goal.findOne({ _id: goalId, user: req.user.id }).select("_id")
        if (!goal) {
            return res.status(404).json({ message: "Goal not found" })
        }

        const identity = { user: req.user.id, goal: goal._id, date }
        if (!completed) {
            await CheckIn.deleteOne(identity)
            return res.status(200).json({ message: "Habit check-in removed" })
        }

        const checkIn = await CheckIn.findOneAndUpdate(
            identity,
            { $set: { completed: true } },
            { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
        ).populate("goal", "category title dailyAction")

        return res.status(200).json({ message: "Habit checked in", checkIn })
    } catch (error) {
        if (error.code === 11000) {
            const checkIn = await CheckIn.findOne({
                user: req.user.id,
                goal: req.body?.goalId,
                date: req.body?.date
            }).populate("goal", "category title dailyAction")
            if (checkIn) return res.status(200).json({ message: "Habit checked in", checkIn })
        }

        console.error(error)
        return res.status(500).json({ message: "Failed to save habit check-in" })
    }
}

module.exports = { getCheckIns, saveCheckIn }
