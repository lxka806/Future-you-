const express = require("express")
const protect = require("../middleware/auth.middleware")
const {
    GenerateFutureStory,
    GetFutureStories,
    GetFutureStoryById,
    DeleteFutureStory
} = require("../controllers/futureStory.controller")

const futureStoryRouter = express.Router()

futureStoryRouter.use(protect)
futureStoryRouter.post("/generate", GenerateFutureStory)
futureStoryRouter.get("/", GetFutureStories)
futureStoryRouter.get("/:storyId", GetFutureStoryById)
futureStoryRouter.delete("/:storyId", DeleteFutureStory)

module.exports = futureStoryRouter
