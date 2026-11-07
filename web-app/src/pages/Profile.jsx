import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import AppPage from "../components/AppPage"
import { useAuth } from "../context/useAuth"
import api from "../services/api"

const getDateKey = date => date.toISOString().slice(0, 10)

const calculateStreak = dates => {
    const dateSet = new Set(dates)
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    const todayKey = getDateKey(today)
    const yesterday = new Date(today)
    yesterday.setUTCDate(yesterday.getUTCDate() - 1)

    let currentStreak = 0
    const currentStart = dateSet.has(todayKey) ? today : yesterday
    if (dateSet.has(getDateKey(currentStart))) {
        const date = new Date(currentStart)
        while (dateSet.has(getDateKey(date))) {
            currentStreak += 1
            date.setUTCDate(date.getUTCDate() - 1)
        }
    }

    const sortedDates = [...dateSet].sort()
    let longestStreak = 0
    let runningStreak = 0
    let previousDate = null

    for (const dateKey of sortedDates) {
        const date = new Date(`${dateKey}T00:00:00.000Z`)
        if (previousDate) {
            const expected = new Date(previousDate)
            expected.setUTCDate(expected.getUTCDate() + 1)
            runningStreak = getDateKey(expected) === dateKey ? runningStreak + 1 : 1
        } else {
            runningStreak = 1
        }
        longestStreak = Math.max(longestStreak, runningStreak)
        previousDate = date
    }

    return { currentStreak, longestStreak }
}

function Profile() {
    const { user, deleteAccount } = useAuth()
    const navigate = useNavigate()
    const [stats, setStats] = useState(null)
    const [loadingStats, setLoadingStats] = useState(true)
    const [statsError, setStatsError] = useState("")
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const [deletePassword, setDeletePassword] = useState("")
    const [deletingAccount, setDeletingAccount] = useState(false)
    const [deleteError, setDeleteError] = useState("")

    useEffect(() => {
        let active = true
        const loadProfileStats = async () => {
            try {
                const today = new Date()
                today.setUTCHours(0, 0, 0, 0)
                const todayKey = getDateKey(today)
                const from = new Date(today)
                from.setUTCFullYear(from.getUTCFullYear() - 1)
                const fromKey = getDateKey(from)

                const [goalsResponse, journalsResponse, checkInsResponse] = await Promise.all([
                    api.get("/api/goals/myGoals"),
                    api.get("/api/journal"),
                    api.get(`/api/check-ins?from=${fromKey}&to=${todayKey}`)
                ])

                if (!active) return

                const goals = goalsResponse.data.goals || []
                const checkIns = checkInsResponse.data.checkIns || []
                const datesByGoal = new Map()
                const allDates = new Set()
                const recentDates = new Set()
                const weekStart = new Date(today)
                weekStart.setUTCDate(weekStart.getUTCDate() - 6)
                const weekStartKey = getDateKey(weekStart)

                for (const checkIn of checkIns) {
                    if (!checkIn.completed || !checkIn.goal?._id) continue
                    const goalId = String(checkIn.goal._id)
                    if (!datesByGoal.has(goalId)) datesByGoal.set(goalId, new Set())
                    datesByGoal.get(goalId).add(checkIn.date)
                    allDates.add(checkIn.date)
                    if (checkIn.date >= weekStartKey && checkIn.date <= todayKey) {
                        recentDates.add(checkIn.date)
                    }
                }

                const streak = calculateStreak([...allDates])
                const perGoal = goals.map(goal => ({
                    ...goal,
                    completedDays: datesByGoal.get(String(goal._id))?.size || 0,
                    streak: calculateStreak([...(datesByGoal.get(String(goal._id)) || [])]).currentStreak
                }))

                setStats({
                    activeGoals: goals.filter(goal => goal.status !== "completed").length,
                    totalGoals: goals.length,
                    journalEntries: (journalsResponse.data.journals || []).length,
                    currentStreak: streak.currentStreak,
                    longestStreak: streak.longestStreak,
                    activeDaysThisWeek: recentDates.size,
                    goals: perGoal
                })
            } catch (error) {
                if (active) {
                    setStatsError(error.response?.data?.message || "Could not load your profile activity.")
                }
            } finally {
                if (active) setLoadingStats(false)
            }
        }

        loadProfileStats()
        return () => {
            active = false
        }
    }, [])

    const handleDeleteAccount = async event => {
        event.preventDefault()
        setDeletingAccount(true)
        setDeleteError("")
        try {
            await deleteAccount(deletePassword)
            navigate("/login", { replace: true })
        } catch (error) {
            setDeleteError(error.response?.data?.message || "Could not delete your account.")
            setDeletingAccount(false)
        }
    }

    const initial = user?.username?.charAt(0)?.toUpperCase() || "U"

    return (
        <AppPage className="bg-[#080808] text-white">
            <div className="p-6 md:p-10 max-w-5xl mx-auto">
                
                {/* HEADER */}
                <header className="mb-10 border-b border-[#222222] pb-8">
                    <p className="mb-2 text-xs tracking-[0.2em] uppercase text-[#A3A3A3] font-semibold">
                        Account
                    </p>
                    <h1 className="text-3xl font-bold">My Profile</h1>
                    <p className="mt-2 text-[#A3A3A3]">
                        Manage your personal information and account settings.
                    </p>
                </header>

                {statsError && (
                    <div role="alert" className="mb-6 rounded-xl border border-[#303030] bg-[#222222] p-4 text-white">
                        {statsError}
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-3 items-start">
                    
                    {/* MAIN PROFILE CARD (Left Column) */}
                    <section className="lg:col-span-2 rounded-2xl border border-[#303030] bg-[#171717] p-6 md:p-8">
                        
                        {/* Avatar & Identity */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
                            {user?.profilePicture ? (
                                <img
                                    src={user.profilePicture}
                                    alt={`${user.username || "Your"} profile`}
                                    className="h-24 w-24 rounded-full border border-[#303030] object-cover shadow-sm"
                                />
                            ) : (
                                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#222222] border border-[#303030] text-3xl font-bold text-white">
                                    {initial}
                                </div>
                            )}
                            <div>
                                <h2 className="text-2xl font-semibold mb-1">
                                    {user?.username || "User"}
                                </h2>
                                <p className="text-[#A3A3A3] mb-3">{user?.email}</p>
                                <span className="inline-block bg-[#222222] border border-[#303030] text-[#A3A3A3] text-xs px-3 py-1 rounded-full">
                                    Free Plan
                                </span>
                            </div>
                        </div>

                        {/* Details List */}
                        <div className="border-t border-[#303030] pt-6 mb-8">
                            <h3 className="text-sm font-semibold text-white mb-4">Account Details</h3>
                            <dl className="space-y-4">
                                <div className="flex flex-wrap justify-between items-center py-2 border-b border-[#222222]">
                                    <dt className="text-sm text-[#A3A3A3]">Username</dt>
                                    <dd className="font-medium">{user?.username || "Not set"}</dd>
                                </div>
                                <div className="flex flex-wrap justify-between items-center py-2 border-b border-[#222222]">
                                    <dt className="text-sm text-[#A3A3A3]">Email address</dt>
                                    <dd className="font-medium">{user?.email || "Not set"}</dd>
                                </div>
                                <div className="flex flex-wrap justify-between items-center py-2">
                                    <dt className="text-sm text-[#A3A3A3]">Member since</dt>
                                    <dd className="font-medium">
                                        {user?.createdAt 
                                            ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) 
                                            : "Recently"}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        <Link
                            to="/settings"
                            className="inline-flex items-center justify-center w-full sm:w-auto rounded-lg bg-white px-6 py-3 font-semibold text-black transition hover:bg-[#A3A3A3]"
                        >
                            Edit Profile Settings
                        </Link>
                    </section>

                    {/* SIDEBAR (Right Column) */}
                    <div className="space-y-6">
                        
                        {/* SNAPSHOT GRID */}
                        <section className="rounded-2xl border border-[#303030] bg-[#171717] p-6">
                            <h3 className="text-sm font-semibold text-white mb-4">Your Snapshot</h3>
                            <div className="grid grid-cols-2 gap-3">
                                
                                <div className="bg-[#080808] border border-[#222222] rounded-xl p-3">
                                    <p className="text-[10px] uppercase tracking-wider text-[#A3A3A3] mb-1">Active Goals</p>
                                    <p className="text-xl font-bold text-white">
                                        {loadingStats ? "…" : stats?.activeGoals ?? "—"}
                                    </p>
                                </div>
                                
                                <div className="bg-[#080808] border border-[#222222] rounded-xl p-3">
                                    <p className="text-[10px] uppercase tracking-wider text-[#A3A3A3] mb-1">Journal Entries</p>
                                    <p className="text-xl font-bold text-white">
                                        {loadingStats ? "…" : stats?.journalEntries ?? "—"}
                                    </p>
                                </div>
                                
                                <div className="bg-[#080808] border border-[#222222] rounded-xl p-3">
                                    <p className="text-[10px] uppercase tracking-wider text-[#A3A3A3] mb-1">Active Days</p>
                                    <p className="text-xl font-bold text-white">
                                        {loadingStats ? "…" : `${stats?.activeDaysThisWeek ?? 0}/7`}
                                    </p>
                                </div>
                                
                                <div className="bg-[#080808] border border-[#222222] rounded-xl p-3">
                                    <p className="text-[10px] uppercase tracking-wider text-[#A3A3A3] mb-1">Best Streak</p>
                                    <p className="text-xl font-bold text-white">
                                        {loadingStats ? "…" : `${stats?.longestStreak ?? 0} d`}
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* STREAK FEATURE CARD */}
                        <section className="rounded-2xl border border-[#303030] bg-[#171717] p-6 relative overflow-hidden">
                            {/* Subtle background gradient for depth */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#222222] rounded-full blur-3xl opacity-50 -mr-10 -mt-10 pointer-events-none" />
                            
                            <h3 className="mb-1 text-sm font-semibold text-white relative z-10">Current Streak</h3>
                            
                            {loadingStats ? (
                                <p className="text-sm text-[#A3A3A3]">Loading...</p>
                            ) : (
                                <div className="relative z-10 mt-4">
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <p className="text-5xl font-bold tracking-tighter text-white">
                                            {stats?.currentStreak ?? 0}
                                        </p>
                                        <p className="text-sm text-[#A3A3A3]">days</p>
                                    </div>
                                    <p className="text-xs text-[#A3A3A3] leading-relaxed mt-3">
                                        A day counts when you check in at least one goal. Keep it up to maintain your streak.
                                    </p>
                                </div>
                            )}
                        </section>

                        {/* GOAL STREAKS LIST */}
                        <section className="rounded-2xl border border-[#303030] bg-[#171717] p-6">
                            <div className="mb-4 flex items-center justify-between gap-2">
                                <h3 className="text-sm font-semibold text-white">Goal Streaks</h3>
                                <Link to="/progress" className="text-xs text-[#A3A3A3] hover:text-white transition-colors">
                                    View progress
                                </Link>
                            </div>
                            {loadingStats ? (
                                <p className="text-sm text-[#A3A3A3]">Loading...</p>
                            ) : stats?.goals.length ? (
                                <ul className="space-y-4">
                                    {stats.goals.map(goal => (
                                        <li key={goal._id} className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-white mb-0.5">
                                                    {goal.title}
                                                </p>
                                                <p className="text-xs text-[#A3A3A3]">
                                                    {goal.completedDays} check-in{goal.completedDays === 1 ? "" : "s"}
                                                </p>
                                            </div>
                                            <span className="shrink-0 text-sm font-bold text-white bg-[#222222] px-2 py-0.5 rounded">
                                                {goal.streak}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-[#A3A3A3]">Your goal streaks will appear after your first check-in.</p>
                            )}
                        </section>

                        {/* ACCOUNT MANAGEMENT */}
                        <section className="rounded-2xl border border-[#303030] bg-[#171717] p-6">
                            <h3 className="text-sm font-semibold text-white mb-2">Account Management</h3>
                            <p className="text-xs text-[#A3A3A3] mb-4 leading-relaxed">
                                Permanently delete your account, goals, habit check-ins, journal entries, stories, and motivation history. This action cannot be undone.
                            </p>
                            {!showDeleteConfirmation ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDeleteError("")
                                        setShowDeleteConfirmation(true)
                                    }}
                                    className="w-full rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-300 transition hover:border-red-400 hover:bg-red-500/10"
                                >
                                    Delete Account
                                </button>
                            ) : (
                                <form onSubmit={handleDeleteAccount} className="space-y-3">
                                    <label htmlFor="delete-account-password" className="block text-xs text-[#A3A3A3]">
                                        Confirm with your current password
                                    </label>
                                    <input
                                        id="delete-account-password"
                                        type="password"
                                        value={deletePassword}
                                        onChange={event => setDeletePassword(event.target.value)}
                                        autoComplete="current-password"
                                        required
                                        className="w-full rounded-lg border border-[#404040] bg-[#080808] px-3 py-2 text-sm text-white outline-none focus:border-red-400"
                                    />
                                    {deleteError && (
                                        <p role="alert" className="text-sm text-red-300">{deleteError}</p>
                                    )}
                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            disabled={deletingAccount}
                                            className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
                                        >
                                            {deletingAccount ? "Deleting..." : "Permanently delete"}
                                        </button>
                                        <button
                                            type="button"
                                            disabled={deletingAccount}
                                            onClick={() => {
                                                setShowDeleteConfirmation(false)
                                                setDeletePassword("")
                                                setDeleteError("")
                                            }}
                                            className="rounded-lg border border-[#404040] px-3 py-2 text-sm text-[#A3A3A3] hover:bg-[#222222] disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </AppPage>
    )
}

export default Profile