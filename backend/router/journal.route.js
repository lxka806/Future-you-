const express = require("express")
const protect = require("../middleware/auth.middleware")
const {
    getJournals,
    createJournal,
    getJournalById,
    updateJournal,
    deleteJournal
} = require("../controllers/journal.controller")

const journalRouter = express.Router()

journalRouter.use(protect)
journalRouter.get("/", getJournals)
journalRouter.post("/", createJournal)
journalRouter.get("/:journalId", getJournalById)
journalRouter.put("/:journalId", updateJournal)
journalRouter.delete("/:journalId", deleteJournal)

module.exports = journalRouter
