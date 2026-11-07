const express = require("express")

const goalRouter = express.Router()


const {
    GetGoalOptions,
    ChooseGoals,
    GetMyGoals,
    GetGoalById,
    UpdateGoal,
    DeleteGoal,
    CompleteGoal,
    RestartGoal,
    GetGoalProgress
} = require("../controllers/goal.controller")

const protect = require("../middleware/auth.middleware")

goalRouter.get("/options", protect, GetGoalOptions)
goalRouter.post("/choose", protect, ChooseGoals)
goalRouter.get("/myGoals", protect, GetMyGoals)
goalRouter.get("/:goalId/progress", protect, GetGoalProgress)
goalRouter.patch("/:goalId/complete", protect, CompleteGoal)
goalRouter.patch("/:goalId/restart", protect, RestartGoal)
goalRouter.get("/:goalId", protect, GetGoalById)
goalRouter.put("/:goalId", protect, UpdateGoal)
goalRouter.delete("/:goalId", protect, DeleteGoal)

module.exports = goalRouter