import { useEffect, useMemo, useState } from "react"
import AppPage from "../components/AppPage"
import api from "../services/api"

function GoalProgress() {
    const [goals, setGoals] = useState([])
    const [progressByGoal, setProgressByGoal] = useState({})
    const [habitCheckIns, setHabitCheckIns] = useState({})
    const [loading, setLoading] = useState(true)
    const [savingGoalId, setSavingGoalId] = useState("")
    const [error, setError] = useState("")
    const { todayKey, fromKey, habitDays } = useMemo(() => {
        const today = new Date().toISOString().slice(0, 10)
        const firstDay = new Date(`${today}T00:00:00.000Z`)
        firstDay.setUTCDate(firstDay.getUTCDate() - 6)
        const from = firstDay.toISOString().slice(0, 10)
        const days = Array.from({ length: 7 }, (_, index) => {
            const date = new Date(`${from}T00:00:00.000Z`)
            date.setUTCDate(date.getUTCDate() + index)
            return {
                key: date.toISOString().slice(0, 10),
                label: date.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" })
            }
        })
        return { todayKey: today, fromKey: from, habitDays: days }
    }, [])

    useEffect(() => {
        let active = true
        api.get("/api/goals/myGoals")
            .then(response => {
                const fetchedGoals = response.data.goals || []
                if (active) setGoals(fetchedGoals)
                return Promise.all([
                    Promise.all(fetchedGoals.map(async goal => {
                        const result = await api.get(`/api/goals/${goal._id}/progress`)
                        return [goal._id, result.data]
                    })),
                    api.get(`/api/check-ins?from=${fromKey}&to=${todayKey}`)
                        .then(result => result.data.checkIns || [])
                ])
            })
            .then(([results, checkIns]) => {
                if (!active) return
                setProgressByGoal(Object.fromEntries(results))
                const checkInData = {}
                for (const checkIn of checkIns) {
                    const goalId = checkIn.goal?._id || checkIn.goal
                    if (goalId) checkInData[`${goalId}:${checkIn.date}`] = true
                }
                setHabitCheckIns(checkInData)
            })
            .catch(error => {
                if (active) {
                    setError(error.response?.data?.message || "Failed to load goal progress.")
                }
            })
            .finally(() => {
                if (active) setLoading(false)
            })

        return () => {
            active = false
        }
    }, [fromKey, todayKey])

    const updateStatus = async (goal) => {
        setSavingGoalId(goal._id)
        setError("")
        try {
            const action = goal.status === "completed" ? "restart" : "complete"
            const response = await api.patch(`/api/goals/${goal._id}/${action}`)
            const updatedGoal = response.data.goal
            setGoals(previous => previous.map(item =>
                item._id === goal._id ? updatedGoal : item
            ))
            setProgressByGoal(previous => ({
                ...previous,
                [goal._id]: {
                    ...previous[goal._id],
                    status: updatedGoal.status,
                    overallProgress: updatedGoal.progress
                }
            }))
        } catch (error) {
            setError(error.response?.data?.message || "Failed to update this goal.")
        } finally {
            setSavingGoalId("")
        }
    }

    return (
        <AppPage className="bg-[#080808] px-10 py-10 text-white">
            <header className="mb-8">
                <p className="mb-2 text-sm tracking-widest text-[#A3A3A3]">YOUR JOURNEY</p>
                <h1 className="text-3xl font-bold">Goal Progress</h1>
                <p className="mt-2 text-[#A3A3A3]">Review your consistency and progress for each goal.</p>
            </header>

            {error && <p role="alert" className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">{error}</p>}
            {loading ? (
                <p className="text-[#A3A3A3]">Loading your progress...</p>
            ) : goals.length === 0 ? (
                <p className="text-[#A3A3A3]">Choose a goal to start tracking your progress.</p>
            ) : (
                <div className="grid gap-5 lg:grid-cols-2">
                    {goals.map(goal => {
                        const progress = progressByGoal[goal._id] || {}
                        const percentage = progress.overallProgress ?? goal.progress ?? 0
                        return (
                            <article key={goal._id} className="rounded-2xl border border-[#303030] bg-[#171717] p-6">
                                <p className="mb-2 text-xs uppercase tracking-wider text-[#A3A3A3]">{goal.category}</p>
                                <h2 className="mb-5 text-xl font-semibold">{goal.title}</h2>
                                <div className="mb-2 flex justify-between text-sm">
                                    <span className="text-[#A3A3A3]">Overall progress</span>
                                    <span>{percentage}%</span>
                                </div>
                                <div className="mb-5 h-2 overflow-hidden rounded-full bg-[#222222]">
                                    <div className="h-full rounded-full bg-white" style={{ width: `${percentage}%` }} />
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <p className="rounded-lg bg-[#222222] p-3">
                                        This week <strong className="block pt-1">{progress.dailyConsistency?.completedDaysLast7Days || 0}/7 days</strong>
                                    </p>
                                    <p className="rounded-lg bg-[#222222] p-3">
                                        Current streak <strong className="block pt-1">{progress.streak || 0} days</strong>
                                    </p>
                                </div>
                                <div className="mt-5">
                                    <p className="mb-2 text-xs uppercase tracking-wider text-[#A3A3A3]">
                                        Daily action: {goal.dailyAction}
                                    </p>
                                    <div className="flex gap-2">
                                        {habitDays.map(day => {
                                            const completed = Boolean(habitCheckIns[`${goal._id}:${day.key}`])
                                            return (
                                                <div key={day.key} className="flex flex-1 flex-col items-center gap-1">
                                                    <span
                                                        title={`${day.key}: ${completed ? "completed" : "not completed"}`}
                                                        className={`flex h-8 w-full items-center justify-center rounded-md border text-xs ${
                                                            completed
                                                                ? "border-white bg-white text-black"
                                                                : "border-[#303030] bg-[#222222] text-transparent"
                                                        }`}
                                                    >
                                                        ✓
                                                    </span>
                                                    <span className="text-[10px] text-[#A3A3A3]">{day.label}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => updateStatus(goal)}
                                    disabled={savingGoalId === goal._id}
                                    className="mt-5 rounded-lg border border-[#555] px-4 py-2 text-sm transition hover:bg-[#222] disabled:opacity-50"
                                >
                                    {savingGoalId === goal._id ? "Updating..." : goal.status === "completed" ? "Restart goal" : "Mark complete"}
                                </button>
                            </article>
                        )
                    })}
                </div>
            )}
        </AppPage>
    )
}

export default GoalProgress
