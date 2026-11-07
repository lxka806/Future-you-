const mongoose = require("mongoose")

const reviewSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 60
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
            validate: {
                validator: Number.isInteger,
                message: "Rating must be a whole number from 1 to 5"
            }
        },
        comment: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1200
        }
    },
    { timestamps: true }
)

reviewSchema.index({ createdAt: -1 })

module.exports = mongoose.model("Review", reviewSchema)
