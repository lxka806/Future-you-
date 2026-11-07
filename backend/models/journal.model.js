const mongoose = require("mongoose")

const journalSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120
        },
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 20000
        }
    },
    { timestamps: true }
)

journalSchema.index({ user: 1, updatedAt: -1 })

module.exports = mongoose.model("Journal", journalSchema)
