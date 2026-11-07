const express = require("express")

const authRouter = express.Router()

const {
    register,
    login,
    logout,
    profile,
    updateProfile,
    deleteAccount
} = require('../controllers/auth.controller')

const protect = require('../middleware/auth.middleware')

authRouter.post("/register", register)
authRouter.post("/login", login)
authRouter.post("/logout", logout)
authRouter.get("/profile", protect, profile)
authRouter.put("/editProfile", protect, updateProfile)
authRouter.delete("/account", protect, deleteAccount)

module.exports = authRouter