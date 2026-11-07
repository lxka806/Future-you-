import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import AppPage from "../components/AppPage"
import { useAuth } from "../context/useAuth"
import api from "../services/api"

function Dashboard() {
    const { user } = useAuth()

    // Data State
    const [goals, setGoals] = useState([])
    const [goalProgress, setGoalProgress] = useState({})
    const [habitCheckIns, setHabitCheckIns] = useState({})
    const [savingCheckIn, setSavingCheckIn] = useState("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    // Timer State
    const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
    const [isTimerRunning, setIsTimerRunning] = useState(false)

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                setLoading(true)
                setError("")

                const response = await api.get("/api/goals/myGoals")
                const fetchedGoals = response.data.goals || []

                setGoals(fetchedGoals)

                const todayKey = new Date().toISOString().slice(0, 10)
                const firstDay = new Date(`${todayKey}T00:00:00.000Z`)
                firstDay.setUTCDate(firstDay.getUTCDate() - 6)
                const fromKey = firstDay.toISOString().slice(0, 10)
                const [progressResults, checkInResponse] = await Promise.all([
                    Promise.allSettled(
                        fetchedGoals.map(goal => api.get(`/api/goals/${goal._id}/progress`))
                    ),
                    api.get(`/api/check-ins?from=${fromKey}&to=${todayKey}`)
                ])

                const progressData = {}

                progressResults.forEach((result, index) => {
                    if (result.status === "fulfilled") {
                        progressData[fetchedGoals[index]._id] =
                            result.value.data
                    }
                })

                setGoalProgress(progressData)
                const checkInData = {}
                for (const checkIn of checkInResponse.data.checkIns || []) {
                    const goalId = checkIn.goal?._id || checkIn.goal
                    if (goalId) checkInData[`${goalId}:${checkIn.date}`] = true
                }
                setHabitCheckIns(checkInData)
            } catch (error) {
                console.error("Dashboard error:", error)
                setError(
                    error.response?.data?.message ||
                    "Failed to load dashboard data."
                )
            } finally {
                setLoading(false)
            }
        }

        fetchDashboard()
    }, [])

    // Timer Logic
    useEffect(() => {
        let interval = null
        let stopTimeout = null
        if (isTimerRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1)
            }, 1000)
            if (timeLeft === 1) {
                stopTimeout = setTimeout(() => setIsTimerRunning(false), 1000)
            }
        }
        return () => {
            clearInterval(interval)
            clearTimeout(stopTimeout)
        }
    }, [isTimerRunning, timeLeft])

    const toggleTimer = () => setIsTimerRunning(!isTimerRunning)
    const resetTimer = () => {
        setIsTimerRunning(false)
        setTimeLeft(25 * 60)
    }

    const todayKey = new Date().toISOString().slice(0, 10)
    const habitDays = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(`${todayKey}T00:00:00.000Z`)
        date.setUTCDate(date.getUTCDate() - (6 - index))
        return {
            key: date.toISOString().slice(0, 10),
            label: date.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" })
        }
    })

    const toggleHabitCheckIn = async (goal, date) => {
        const key = `${goal._id}:${date}`
        const completed = !habitCheckIns[key]
        setSavingCheckIn(key)
        setError("")
        try {
            await api.post("/api/check-ins", {
                goalId: goal._id,
                date,
                completed
            })
            setHabitCheckIns(previous => {
                const next = { ...previous }
                if (completed) next[key] = true
                else delete next[key]
                return next
            })
        } catch (error) {
            setError(error.response?.data?.message || "Could not save your habit check-in.")
        } finally {
            setSavingCheckIn("")
        }
    }

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    // Calculations
    const completedGoals = goals.filter((goal) => goal.status === "completed")
    const activeGoals = goals.filter((goal) => goal.status !== "completed")

    const averageProgress = goals.length
        ? Math.round(
            goals.reduce((total, goal) => {
                const progress = goalProgress[goal._id]?.overallProgress ?? goal.progress ?? 0
                return total + progress
            }, 0) / goals.length
        )
        : 0

    const weeklyConsistency = Object.values(goalProgress)
    const averageWeeklyConsistency = weeklyConsistency.length
        ? Math.round(
            weeklyConsistency.reduce(
                (total, item) => total + (item.dailyConsistency?.weeklyCompletionPercentage || 0),
                0
            ) / weeklyConsistency.length
        )
        : 0

    const formatDate = (date) => {
        if (!date) return "No deadline"
        return new Date(date).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric"
        })
    }

    const today = new Date().toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric' })

    if (loading) {
        return (
            <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center">
                Loading your dashboard...
            </div>
        )
    }

    return (
        <AppPage className="bg-[#080808] text-white">
            <div className="p-8 md:p-10 max-w-[1400px] mx-auto">
                
                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-10">
                    <div>
                        <p className="text-[#A3A3A3] text-xs mb-2 tracking-[0.2em] uppercase font-semibold">
                            {today}
                        </p>
                        <h1 className="text-3xl font-bold mb-2">
                            Welcome back, <span className="text-white">{user?.username || "User"}</span>
                        </h1>
                        <p className="text-[#A3A3A3]">
                            Every small step brings you closer to your future.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link to="/goals">
                            <button className="bg-white text-black px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#A3A3A3] transition">
                                + Add New Goal
                            </button>
                        </Link>
                        {user?.profilePicture && (
                            <img
                                src={user.profilePicture}
                                alt="Profile"
                                className="w-10 h-10 rounded-full object-cover border border-[#303030]"
                            />
                        )}
                    </div>
                </div>

                {error && (
                    <div className="bg-[#222222] border border-[#303030] text-white p-4 rounded-xl mb-8">
                        {error}
                    </div>
                )}

                {/* STATISTICS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard title="Total Goals" value={goals.length} subtext="All time" />
                    <StatCard title="Active Goals" value={activeGoals.length} subtext="In progress" />
                    <StatCard title="Completed" value={completedGoals.length} subtext="Great job!" />
                    <StatCard title="Avg. Progress" value={`${averageProgress}%`} subtext="Across all goals" />
                </div>

                {/* INTERACTIVE FOCUS & RESET ROW */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                    
                    {/* Pomodoro Timer */}
                    <div className="bg-[#171717] border border-[#303030] rounded-2xl p-6 flex flex-col justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-white mb-1">Focus Session</h2>
                            <p className="text-[#A3A3A3] text-sm">Deep work, no distractions.</p>
                        </div>
                        
                        <div className="my-6 text-center">
                            <div className={`text-5xl font-mono font-bold tracking-tighter ${isTimerRunning ? 'text-white' : 'text-[#A3A3A3]'}`}>
                                {formatTime(timeLeft)}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={toggleTimer}
                                className="flex-1 bg-white text-black py-2.5 rounded-lg text-sm font-semibold hover:bg-[#A3A3A3] transition"
                            >
                                {isTimerRunning ? "Pause" : "Start Focus"}
                            </button>
                            <button 
                                onClick={resetTimer}
                                className="bg-[#222222] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#303030] transition border border-[#303030]"
                            >
                                Reset
                            </button>
                        </div>
                    </div>

                    {/* Quick Brain Reset / Journal */}
                    <div className="bg-[#171717] border border-[#303030] rounded-2xl p-6 flex flex-col justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-white mb-1">Brain Reset</h2>
                            <p className="text-[#A3A3A3] text-sm">Need a pause? Reset your mind.</p>
                        </div>
                        
                        <div className="flex flex-col gap-2 mt-4">
                            <button className="flex items-center gap-3 text-sm text-[#A3A3A3] hover:text-white bg-[#222222] hover:bg-[#303030] p-2.5 rounded-lg transition border border-transparent hover:border-[#303030] text-left">
                                <span className="text-lg">🌬️</span> 1-Minute Breathing
                            </button>
                            <button className="flex items-center gap-3 text-sm text-[#A3A3A3] hover:text-white bg-[#222222] hover:bg-[#303030] p-2.5 rounded-lg transition border border-transparent hover:border-[#303030] text-left">
                                <span className="text-lg">💧</span> Take a Water Break
                            </button>
                            <Link to="/journal/new" className="flex items-center gap-3 text-sm text-[#A3A3A3] hover:text-white bg-[#222222] hover:bg-[#303030] p-2.5 rounded-lg transition border border-transparent hover:border-[#303030] text-left">
                                <span className="text-lg">🧠</span> Quick Brain Dump
                            </Link>
                        </div>
                    </div>

                    {/* Habit Tracker */}
                    <div className="bg-[#171717] border border-[#303030] rounded-2xl p-6 flex flex-col justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-white mb-1">Core Habits</h2>
                            <p className="text-[#A3A3A3] text-sm">Track your daily actions over the last seven days.</p>
                        </div>

                        <div className="mt-4 mb-2 space-y-4">
                            {activeGoals.length === 0 ? (
                                <p className="text-sm text-[#A3A3A3]">Add a goal to start tracking daily habits.</p>
                            ) : activeGoals.slice(0, 3).map(goal => (
                                <div key={goal._id}>
                                    <p className="mb-1 truncate text-sm font-medium">{goal.title}</p>
                                    <p className="mb-2 line-clamp-1 text-xs text-[#A3A3A3]">{goal.dailyAction}</p>
                                    <div className="flex gap-1.5">
                                        {habitDays.map(day => {
                                            const key = `${goal._id}:${day.key}`
                                            const complete = Boolean(habitCheckIns[key])
                                            return (
                                                <button
                                                    key={day.key}
                                                    type="button"
                                                    title={`${day.key} (${day.label}): ${complete ? "completed" : "not completed"} — ${goal.dailyAction}`}
                                                    aria-label={`${goal.title}, ${day.label}, ${complete ? "completed" : "not completed"}`}
                                                    disabled={savingCheckIn === key || day.key > todayKey}
                                                    onClick={() => toggleHabitCheckIn(goal, day.key)}
                                                    className={`flex-1 rounded-md border py-1.5 text-center text-[10px] transition disabled:cursor-wait disabled:opacity-50 ${
                                                        complete
                                                            ? "border-white bg-white text-black"
                                                            : "border-[#303030] bg-[#222222] text-[#A3A3A3] hover:border-[#777] hover:text-white"
                                                    }`}
                                                >
                                                    {complete ? "✓" : day.label.slice(0, 1)}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Link to="/progress" className="w-full text-center text-xs text-[#A3A3A3] hover:text-white py-2 transition">
                            View All Habits →
                        </Link>
                    </div>
                </div>

                {/* METRICS GRID (PROGRESS & CONSISTENCY) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                    <div className="bg-[#171717] border border-[#303030] rounded-2xl p-6 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-lg font-semibold text-white">Overall Progress</h2>
                                <p className="text-[#A3A3A3] text-sm mt-1">Average across all goals</p>
                            </div>
                            <span className="text-3xl font-bold text-white">{averageProgress}%</span>
                        </div>
                        
                        <div>
                            <div className="w-full h-3 bg-[#222222] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-white rounded-full transition-all"
                                    style={{ width: `${averageProgress}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-[#A3A3A3] mt-2">
                                <span>0%</span>
                                <span>100%</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#171717] border border-[#303030] rounded-2xl p-6 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-lg font-semibold text-white">Weekly Consistency</h2>
                                <p className="text-[#A3A3A3] text-sm mt-1">Last 7 days completion</p>
                            </div>
                            <span className="text-3xl font-bold text-white">{averageWeeklyConsistency}%</span>
                        </div>
                        
                        <div>
                            <div className="flex items-end gap-1 h-8">
                                {[40, 70, 30, 80, 100, 60, averageWeeklyConsistency].map((val, i) => (
                                    <div key={i} className="flex-1 bg-[#303030] rounded-t-sm relative group">
                                        <div 
                                            className="absolute bottom-0 w-full bg-[#A3A3A3] rounded-t-sm group-hover:bg-white transition-all" 
                                            style={{ height: `${val}%` }}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between text-xs text-[#A3A3A3] mt-2">
                                <span>Mon</span>
                                <span>Sun</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* GOALS */}
                <div className="mb-10">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">Your Goals</h2>
                        <button className="text-sm text-[#A3A3A3] hover:text-white transition">View all</button>
                    </div>

                    {goals.length === 0 ? (
                        <div className="bg-[#171717] border border-[#303030] rounded-2xl p-8 text-center">
                            <h3 className="text-lg font-semibold mb-2">No goals yet</h3>
                            <p className="text-[#A3A3A3]">Create your first goal and start working towards your future.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            {goals.map((goal) => {
                                const progress = goalProgress[goal._id]?.overallProgress ?? goal.progress ?? 0
                                return (
                                    <div
                                        key={goal._id}
                                        className="bg-[#171717] border border-[#303030] rounded-2xl p-6 hover:border-[#A3A3A3] transition-colors"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="text-[#A3A3A3] text-xs uppercase tracking-wider mb-2">
                                                    {goal.category}
                                                </p>
                                                <h3 className="text-lg font-semibold">{goal.title}</h3>
                                            </div>
                                            <span className={`text-xs px-2.5 py-1 rounded-md capitalize border ${
                                                goal.status === "completed" 
                                                    ? "bg-white text-black border-white" 
                                                    : "text-[#A3A3A3] bg-[#222222] border-[#303030]"
                                            }`}>
                                                {goal.status}
                                            </span>
                                        </div>

                                        <p className="text-[#A3A3A3] text-sm mb-6 line-clamp-2">
                                            {goal.description}
                                        </p>

                                        <div className="mt-auto">
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-[#A3A3A3]">Progress</span>
                                                <span className="text-white font-medium">{progress}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-[#222222] rounded-full overflow-hidden mb-4">
                                                <div
                                                    className="h-full bg-white rounded-full"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between items-center text-xs text-[#A3A3A3]">
                                                <span>Deadline: {formatDate(goal.deadline)}</span>
                                                <span className="hover:text-white cursor-pointer transition">View Details →</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* DAILY ACTIONS */}
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">Today's Actions</h2>
                        <span className="text-[#A3A3A3] text-sm">{activeGoals.length} tasks</span>
                    </div>

                    {activeGoals.length === 0 ? (
                        <div className="bg-[#171717] border border-[#303030] rounded-xl p-6 text-center">
                            <p className="text-[#A3A3A3]">You have no active goals. Enjoy your day!</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {activeGoals.map((goal) => (
                                <div
                                    key={goal._id}
                                    className="bg-[#171717] border border-[#303030] rounded-xl p-4 flex items-center gap-4 group hover:border-[#A3A3A3] transition-colors cursor-pointer"
                                >
                                    <div className="w-5 h-5 rounded border border-[#303030] flex items-center justify-center group-hover:border-white transition-colors shrink-0">
                                        <span className="text-transparent group-hover:text-white text-xs transition-colors">✓</span>
                                    </div>
                                    
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-[10px] uppercase tracking-wider text-[#A3A3A3] border border-[#303030] px-2 py-0.5 rounded">
                                                {goal.category}
                                            </span>
                                            <p className="text-white text-sm font-medium">{goal.title}</p>
                                        </div>
                                        <p className="text-[#A3A3A3] text-sm">{goal.dailyAction}</p>
                                    </div>

                                    <button className="text-[#A3A3A3] hover:text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                        Complete
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppPage>
    )
}

function StatCard({ title, value, subtext }) {
    return (
        <div className="bg-[#171717] border border-[#303030] rounded-2xl p-5">
            <p className="text-[#A3A3A3] text-xs font-medium uppercase tracking-wider mb-2">
                {title}
            </p>
            <h3 className="text-3xl font-bold text-white mb-1">
                {value}
            </h3>
            <p className="text-[#A3A3A3] text-xs">
                {subtext}
            </p>
        </div>
    )
}

export default Dashboard