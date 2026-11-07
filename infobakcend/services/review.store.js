const fs = require("node:fs/promises")
const path = require("node:path")
const { randomUUID } = require("node:crypto")
const mongoose = require("mongoose")
const Review = require("../models/review.model")

const reviewsFile = path.join(__dirname, "..", "data", "reviews.json")
let pendingWrite = Promise.resolve()

const readLocalReviews = async () => {
    try {
        const content = await fs.readFile(reviewsFile, "utf8")
        const reviews = JSON.parse(content)
        if (!Array.isArray(reviews)) {
            throw new Error("Local reviews data must be a JSON array")
        }
        return reviews
    } catch (error) {
        if (error.code === "ENOENT") return []
        throw error
    }
}

const listReviews = async () => {
    if (mongoose.connection.readyState === 1) {
        return Review.find()
            .select("name rating comment createdAt")
            .sort({ createdAt: -1 })
            .limit(100)
    }

    if (process.env.NODE_ENV === "production") {
        const error = new Error("Review database is unavailable")
        error.statusCode = 503
        throw error
    }

    return (await readLocalReviews())
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
        .slice(0, 100)
}

const createReview = async ({ name, rating, comment }) => {
    if (mongoose.connection.readyState === 1) {
        return Review.create({ name, rating, comment })
    }

    if (process.env.NODE_ENV === "production") {
        const error = new Error("Review database is unavailable")
        error.statusCode = 503
        throw error
    }

    const review = {
        _id: randomUUID(),
        name,
        rating,
        comment,
        createdAt: new Date().toISOString()
    }

    pendingWrite = pendingWrite.then(async () => {
        const reviews = await readLocalReviews()
        reviews.push(review)
        await fs.mkdir(path.dirname(reviewsFile), { recursive: true })
        await fs.writeFile(reviewsFile, `${JSON.stringify(reviews, null, 2)}\n`, "utf8")
    })
    await pendingWrite
    return review
}

module.exports = { listReviews, createReview }
