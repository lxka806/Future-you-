
const jwt = require("jsonwebtoken")

const protect = (req, res, next) => {
    if (!process.env.JWT_SECRET || !process.env.JWT_SECRET.trim()) {
        console.error("Authentication is unavailable because JWT_SECRET is not configured")
        return res.status(500).json({
            message: "Authentication is temporarily unavailable"
        })
    }

    const token = req.cookies?.token

    if (!token) {
        return res.status(401).json({
            message: "Authentication required. Please log in again."
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        return next()
    } catch (e) {
        if (e.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Your session has expired. Please log in again."
            })
        }

        if (e.name === "JsonWebTokenError") {
            return res.status(401).json({
                message: "Your session is invalid. Please log in again."
            })
        }

        console.error("Authentication token verification failed", e)
        return res.status(500).json({
            message: "Authentication is temporarily unavailable"
        })
    }
}

module.exports = protect
