
import { useEffect, useState } from "react"
import api from "../services/api"
import AuthContext from "./auth-context"

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkUser = async () => {
            try {
                const response = await api.get("/api/auth/profile")
                setUser(response.data.user)
            } catch {
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        checkUser()
    }, [])

    const login = async (email, password) => {
        const response = await api.post("/api/auth/login", {
            email,
            password
        })

        setUser(response.data.user)
    }

    const register = async (username, email, password) => {
        const response = await api.post("/api/auth/register", {
            username,
            email,
            password
        })

        setUser(response.data.user)
    }

    const updateProfile = async (profile) => {
        const response = await api.put("/api/auth/editProfile", profile)
        setUser(response.data.user)
        return response.data.user
    }

    const deleteAccount = async (password) => {
        const response = await api.delete("/api/auth/account", {
            data: { password }
        })
        setUser(null)
        return response.data
    }

    const logout = async () => {
        await api.post("/api/auth/logout")
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, register, updateProfile, deleteAccount, logout }}>
            {children}
        </AuthContext.Provider>
    )
}
