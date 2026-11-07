import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import AppPage from "../components/AppPage"
import { useAuth } from "../context/useAuth"

function Settings() {
    const { user, updateProfile, logout } = useAuth()
    const navigate = useNavigate()
    const fileInputRef = useRef(null)
    
    const [username, setUsername] = useState(user?.username || "")
    const [profilePicture, setProfilePicture] = useState(user?.profilePicture || "")
    const [saving, setSaving] = useState(false)
    const [loggingOut, setLoggingOut] = useState(false)
    const [message, setMessage] = useState("")
    const [error, setError] = useState("")

    // Handle image selection and conversion to base64
    const handleImageChange = (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        // Optional: Check file size (e.g., limit to 2MB)
        if (file.size > 2 * 1024 * 1024) {
            setError("Image size must be less than 2MB.")
            return
        }

        const reader = new FileReader()
        reader.onloadend = () => {
            setProfilePicture(reader.result) // Set the base64 string
            setError("") // Clear any previous errors
        }
        reader.readAsDataURL(file)
    }

    const saveSettings = async (event) => {
        event.preventDefault()
        setSaving(true)
        setMessage("")
        setError("")
        try {
            await updateProfile({ 
                username: username.trim(), 
                profilePicture: profilePicture 
            })
            setMessage("Your profile settings have been saved.")
        } catch (error) {
            setError(error.response?.data?.message || "Failed to save your settings.")
        } finally {
            setSaving(false)
        }
    }

    const handleLogout = async () => {
        setLoggingOut(true)
        setError("")
        try {
            await logout()
            navigate("/login")
        } catch (error) {
            setError(error.response?.data?.message || "Failed to log out. Please try again.")
            setLoggingOut(false)
        }
    }

    return (
        <AppPage className="bg-[#080808] text-white">
            <div className="p-6 md:p-10 max-w-3xl mx-auto">
                
                {/* HEADER */}
                <header className="mb-10 border-b border-[#222222] pb-8">
                    <p className="mb-2 text-xs tracking-[0.2em] uppercase text-[#A3A3A3] font-semibold">
                        Account
                    </p>
                    <h1 className="text-3xl font-bold">Settings</h1>
                    <p className="mt-2 text-[#A3A3A3]">
                        Manage your profile and account preferences.
                    </p>
                </header>

                <form onSubmit={saveSettings} className="space-y-8 rounded-2xl border border-[#303030] bg-[#171717] p-6 md:p-8">
                    
                    {/* IMAGE UPLOAD SECTION */}
                    <div>
                        <label className="mb-4 block text-sm font-semibold text-white">
                            Profile Picture
                        </label>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                            
                            {/* Preview */}
                            <div className="relative group">
                                {profilePicture ? (
                                    <img
                                        src={profilePicture}
                                        alt="Profile Preview"
                                        className="h-24 w-24 rounded-full border border-[#303030] object-cover bg-[#222222]"
                                    />
                                ) : (
                                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#222222] border border-[#303030] text-2xl font-bold text-[#A3A3A3]">
                                        {username?.charAt(0)?.toUpperCase() || "U"}
                                    </div>
                                )}
                            </div>

                            {/* Upload Controls */}
                            <div className="flex flex-col gap-2">
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="rounded-lg border border-[#303030] bg-[#222222] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#303030]"
                                >
                                    Upload New Image
                                </button>
                                <p className="text-xs text-[#A3A3A3]">
                                    JPG, PNG or GIF. Max size 2MB.
                                </p>
                                {profilePicture && (
                                    <button
                                        type="button"
                                        onClick={() => setProfilePicture("")}
                                        className="text-left text-xs text-[#A3A3A3] hover:text-white transition"
                                    >
                                        Remove image
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-[#222222] pt-8 space-y-6">
                        {/* USERNAME */}
                        <div>
                            <label htmlFor="settings-username" className="mb-2 block text-sm font-medium text-[#A3A3A3]">
                                Username
                            </label>
                            <input
                                id="settings-username"
                                value={username}
                                onChange={event => setUsername(event.target.value)}
                                required
                                placeholder="Your display name"
                                className="w-full rounded-lg border border-[#303030] bg-[#080808] px-4 py-3 text-white placeholder-[#555] outline-none transition focus:border-[#A3A3A3]"
                            />
                        </div>

                        {/* EMAIL (Disabled) */}
                        <div>
                            <label htmlFor="settings-email" className="mb-2 block text-sm font-medium text-[#A3A3A3]">
                                Email Address
                            </label>
                            <input
                                id="settings-email"
                                value={user?.email || ""}
                                disabled
                                className="w-full rounded-lg border border-[#222222] bg-[#111111] px-4 py-3 text-[#A3A3A3] cursor-not-allowed"
                            />
                            <p className="mt-2 text-xs text-[#A3A3A3]">
                                Email cannot be changed.
                            </p>
                        </div>
                    </div>

                    {/* STATUS MESSAGES (Monochrome) */}
                    {message && (
                        <div role="status" className="rounded-lg border border-[#303030] bg-[#222222] p-3 text-sm text-white">
                            {message}
                        </div>
                    )}
                    {error && (
                        <div role="alert" className="rounded-lg border border-[#303030] bg-[#222222] p-3 text-sm text-white">
                            {error}
                        </div>
                    )}

                    {/* ACTIONS */}
                    <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#222222]">
                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-lg bg-white px-6 py-2.5 font-semibold text-black transition hover:bg-[#A3A3A3] disabled:opacity-50"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                            type="button"
                            onClick={handleLogout}
                            disabled={loggingOut}
                            className="rounded-lg border border-[#303030] px-6 py-2.5 text-sm text-white transition hover:bg-[#222222] disabled:opacity-50"
                        >
                            {loggingOut ? "Logging out..." : "Log out"}
                        </button>
                    </div>
                </form>
            </div>
        </AppPage>
    )
}

export default Settings