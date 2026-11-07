
const User = require("../models/auth.model")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const CheckIn = require("../models/checkIn.model")
const Goal = require("../models/goals.model")
const Journal = require("../models/journal.model")
const FutureStory = require("../models/futureStory.model")
const DailyMotivation = require("../models/dailyMotivation.model")

const getAuthCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: process.env.NODE_ENV === "development" ? "lax" : "none",
    path: "/"
})

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body

        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }

        const usedEmail = await User.findOne({ email })

        if (usedEmail) {
            return res.status(400).json({ message: "Email already in use" })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = new User({
            username,
            email,
            password: hashedPassword
        })

        await newUser.save()

        const token = jwt.sign(
            {
                id: newUser._id,
                email: newUser.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        )

        res.cookie("token", token, {
            ...getAuthCookieOptions(),
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                profilePicture: newUser.profilePicture
            }
        })

    } catch (e) {
        console.log(e)
        res.status(500).json({ message: "Server error" })
    }
}


const login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }

        const user = await User.findOne({ email })

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" })
        }

        const token = jwt.sign(
            {
                id: user._id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        )

        res.cookie("token", token, {
            ...getAuthCookieOptions(),
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture
            }
        })

    } catch (e) {
        console.log(e)
        res.status(500).json({ message: "Server error" })
    }
}


const logout = (req, res) => {
    res.clearCookie("token", getAuthCookieOptions())

    res.status(200).json({
        message: "Logged out successfully"
    })
}


const profile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password")

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        res.status(200).json({
            user
        })

    } catch (e) {
        console.log(e)
        res.status(500).json({ message: "Server error" })
    }
}


const updateProfile = async (req, res) => {
    try {
        const { username, profilePicture } = req.body

        const user = await User.findById(req.user.id)

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        if (username !== undefined) {
            if (!username.trim()) {
                return res.status(400).json({
                    message: "Username cannot be empty"
                })
            }

            user.username = username.trim()
        }

        if (profilePicture !== undefined) {
            user.profilePicture = profilePicture
        }

        await user.save()

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture
            }
        })

    } catch (e) {
        console.log(e)
        res.status(500).json({
            message: "Server error"
        })
    }
}

const deleteAccount = async (req, res) => {
    try {
        const { password } = req.body || {}
        if (typeof password !== "string" || !password) {
            return res.status(400).json({ message: "Enter your password to delete your account" })
        }

        const user = await User.findById(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        const passwordMatches = await bcrypt.compare(password, user.password)
        if (!passwordMatches) {
            return res.status(401).json({ message: "Password is incorrect" })
        }

        await CheckIn.deleteMany({ user: user._id })
        await Goal.deleteMany({ user: user._id })
        await Journal.deleteMany({ user: user._id })
        await FutureStory.deleteMany({ user: user._id })
        await DailyMotivation.deleteMany({ user: user._id })
        await user.deleteOne()

        res.clearCookie("token", {
            ...getAuthCookieOptions()
        })

        return res.status(200).json({ message: "Account and associated data deleted" })
    } catch (e) {
        console.error(e)
        return res.status(500).json({ message: "Failed to delete account" })
    }
}


module.exports = {
    register,
    login,
    logout,
    profile,
    updateProfile,
    deleteAccount
}