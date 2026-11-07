
const mongoose = require("mongoose")

const goalSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        category: {
            type: String,
            required: true,
            enum: [
                "Discipline & Self-Control",
                "Mental Strength",
                "Faith & Spirituality",
                "Relationships & Social Life",
                "Physical Health",
                "Personal Growth",
                "Career & Financial Future",
                "Habits & Addictions"
            ]
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        dailyAction: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        deadline: {
            type: Date,
            required: true,
            validate: {
                validator: value => value instanceof Date && !Number.isNaN(value.getTime()),
                message: "Deadline must be a valid date"
            }
        },
        status: {
            type: String,
            enum: ["not-started", "in-progress", "completed"],
            default: "not-started"
        },
        progress: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("Goal", goalSchema)
