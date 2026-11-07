const mongoose = require("mongoose")
const Journal = require("../models/journal.model")

const isNonEmptyString = value => typeof value === "string" && value.trim().length > 0

const getJournals = async (req, res) => {
    try {
        const journals = await Journal.find({ user: req.user.id })
            .select("title content createdAt updatedAt")
            .sort({ updatedAt: -1 })
        return res.status(200).json({ journals })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Failed to load journal entries" })
    }
}

const createJournal = async (req, res) => {
    try {
        const { title, content } = req.body || {}
        if (!isNonEmptyString(title) || !isNonEmptyString(content)) {
            return res.status(400).json({ message: "A title and journal entry are required" })
        }
        if (title.trim().length > 120 || content.trim().length > 20000) {
            return res.status(400).json({ message: "Title must be at most 120 characters and entry at most 20000 characters" })
        }

        const journal = await Journal.create({
            user: req.user.id,
            title: title.trim(),
            content: content.trim()
        })
        return res.status(201).json({ message: "Journal entry saved", journal })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Failed to save journal entry" })
    }
}

const getJournalById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.journalId)) {
            return res.status(400).json({ message: "Invalid journal entry ID" })
        }
        const journal = await Journal.findOne({
            _id: req.params.journalId,
            user: req.user.id
        })
        if (!journal) return res.status(404).json({ message: "Journal entry not found" })
        return res.status(200).json({ journal })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Failed to load journal entry" })
    }
}

const updateJournal = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.journalId)) {
            return res.status(400).json({ message: "Invalid journal entry ID" })
        }
        const fields = Object.keys(req.body || {})
        if (fields.length === 0 || fields.some(field => !["title", "content"].includes(field))) {
            return res.status(400).json({ message: "Provide a title and/or content to update" })
        }
        for (const field of fields) {
            if (!isNonEmptyString(req.body[field])) {
                return res.status(400).json({ message: `${field} cannot be empty` })
            }
            const maxLength = field === "title" ? 120 : 20000
            if (req.body[field].trim().length > maxLength) {
                return res.status(400).json({
                    message: `${field} must be at most ${maxLength} characters`
                })
            }
        }

        const updates = Object.fromEntries(fields.map(field => [field, req.body[field].trim()]))
        const journal = await Journal.findOneAndUpdate(
            { _id: req.params.journalId, user: req.user.id },
            { $set: updates },
            { new: true, runValidators: true }
        )
        if (!journal) return res.status(404).json({ message: "Journal entry not found" })
        return res.status(200).json({ message: "Journal entry updated", journal })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Failed to update journal entry" })
    }
}

const deleteJournal = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.journalId)) {
            return res.status(400).json({ message: "Invalid journal entry ID" })
        }
        const journal = await Journal.findOneAndDelete({
            _id: req.params.journalId,
            user: req.user.id
        })
        if (!journal) return res.status(404).json({ message: "Journal entry not found" })
        return res.status(200).json({ message: "Journal entry deleted" })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Failed to delete journal entry" })
    }
}

module.exports = { getJournals, createJournal, getJournalById, updateJournal, deleteJournal }
