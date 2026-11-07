const mongoose = require("mongoose")

const futureStorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true,
        trim: true
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

futureStorySchema.index({ user: 1, generatedAt: -1 })

module.exports = mongoose.model("FutureStory", futureStorySchema)