const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        profilePicture: {
            type: String,
            default: "https://i.pinimg.com/736x/d9/45/43/d94543175a8c2984a67811186e9091f0.jpg",
        },
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("User", userSchema)