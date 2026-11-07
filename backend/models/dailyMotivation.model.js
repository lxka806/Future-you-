const mongoose = require("mongoose")

const dailyMotivationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    date: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1200
    },
    generatedAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    goalsUsed: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Goal"
    }]
})

dailyMotivationSchema.index({ user: 1, date: 1 }, { unique: true })
dailyMotivationSchema.index({ user: 1, generatedAt: -1 })

module.exports = mongoose.model("DailyMotivation", dailyMotivationSchema)
