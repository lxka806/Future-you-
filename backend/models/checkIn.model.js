
const mongoose = require("mongoose")

const checkInSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        goal: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Goal",
            required: true
        },
        date: {
            type: String,
            required: true
        },
        completed: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
)

checkInSchema.index(
    { user: 1, goal: 1, date: 1 },
    { unique: true }
)

module.exports = mongoose.model("CheckIn", checkInSchema)
