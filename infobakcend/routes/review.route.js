const express = require("express")
const { listReviews, createReview } = require("../services/review.store")

const reviewRouter = express.Router()

reviewRouter.get("/", async (req, res) => {
    try {
        const reviews = await listReviews()
        return res.status(200).json({ reviews })
    } catch (error) {
        console.error("Could not load reviews:", error)
        return res.status(error.statusCode || 500).json({
            message: error.statusCode ? error.message : "Could not load reviews"
        })
    }
})

reviewRouter.post("/", async (req, res) => {
    try {
        const { name, rating, comment } = req.body || {}
        const normalizedRating = Number(rating)

        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({ message: "Please enter your name" })
        }
        if (name.trim().length > 60) {
            return res.status(400).json({ message: "Name must be 60 characters or fewer" })
        }
        if (!Number.isInteger(normalizedRating) || normalizedRating < 1 || normalizedRating > 5) {
            return res.status(400).json({ message: "Choose a rating from 1 to 5 stars" })
        }
        if (typeof comment !== "string" || !comment.trim()) {
            return res.status(400).json({ message: "Please write a review" })
        }
        if (comment.trim().length > 1200) {
            return res.status(400).json({ message: "Review must be 1200 characters or fewer" })
        }

        const review = await createReview({
            name: name.trim(),
            rating: normalizedRating,
            comment: comment.trim()
        })

        return res.status(201).json({
            message: "Thank you for sharing your review",
            review
        })
    } catch (error) {
        console.error("Could not save review:", error)
        return res.status(error.statusCode || 500).json({
            message: error.statusCode ? error.message : "Could not save your review"
        })
    }
})

module.exports = reviewRouter
