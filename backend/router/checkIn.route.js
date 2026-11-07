const express = require("express")
const protect = require("../middleware/auth.middleware")
const { getCheckIns, saveCheckIn } = require("../controllers/checkIn.controller")

const checkInRouter = express.Router()

checkInRouter.use(protect)
checkInRouter.get("/", getCheckIns)
checkInRouter.post("/", saveCheckIn)

module.exports = checkInRouter
