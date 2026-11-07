import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import AppPage from "../components/AppPage"
import api from "../services/api"

function Goals() {
    const navigate = useNavigate()

    const [goals, setGoals] = useState([])
    const [selectedGoals, setSelectedGoals] = useState([])
    const [goalDeadlines, setGoalDeadlines] = useState({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        const fetchGoals = async () => {
            try {
                setLoading(true)
                setError("")

                const response = await api.get("/api/goals/options")

                const formattedGoals = response.data.goals.flatMap(item => {
                    const categoryName =
                        typeof item.category === "string"
                            ? item.category
                            : item.category?.name || item.name || item.title

                    return (item.goals || []).map(goal => ({
                        ...goal,
                        category: goal.category || categoryName,
                        title: goal.title || goal.name || "",
                        description: goal.description || "",
                        dailyAction: goal.dailyAction || ""
                    }))
                })

                setGoals(formattedGoals)
            } catch (error) {
                console.error("Fetch goals error:", error)

                setError(
                    error.response?.data?.message ||
                    "Failed to load goals. Please try again."
                )
            } finally {
                setLoading(false)
            }
        }

        fetchGoals()
    }, [])

    const toggleGoal = (goal) => {
        const exists = selectedGoals.some(
            selected =>
                selected.category === goal.category &&
                selected.title === goal.title
        )

        if (exists) {
            setSelectedGoals(previous =>
                previous.filter(
                    selected =>
                        selected.category !== goal.category ||
                        selected.title !== goal.title
                )
            )
        } else {
            const key = `${goal.category}:${goal.title}`
            setSelectedGoals(previous => [
                ...previous,
                { ...goal, deadline: goalDeadlines[key] || "" }
            ])
        }
    }

    const updateGoalDeadline = (goal, deadline) => {
        const key = `${goal.category}:${goal.title}`
        setGoalDeadlines(previous => ({ ...previous, [key]: deadline }))
        setSelectedGoals(previous => previous.map(selected =>
            selected.category === goal.category && selected.title === goal.title
                ? { ...selected, deadline }
                : selected
        ))
    }

    const isSelected = (goal) => {
        return selectedGoals.some(
            selected =>
                selected.category === goal.category &&
                selected.title === goal.title
        )
    }

    const handleSubmit = async () => {
        if (selectedGoals.length === 0) {
            setError("Please select at least one goal.")
            return
        }

        const requiredFields = ["category", "title", "description", "dailyAction", "deadline"]
        const invalidGoal = selectedGoals.find(goal =>
            requiredFields.some(field =>
                typeof goal[field] !== "string" || !goal[field].trim()
            )
        )

        if (invalidGoal) {
            const missingField = requiredFields.find(field =>
                typeof invalidGoal[field] !== "string" || !invalidGoal[field].trim()
            )
            const fieldLabel = missingField === "dailyAction"
                ? "daily action"
                : missingField

            setError(`Please provide a ${fieldLabel} for "${invalidGoal.title || "this goal"}".`)
            return
        }

        const validDate = goal => {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(goal.deadline)) return false
            const date = new Date(`${goal.deadline}T00:00:00.000Z`)
            return !Number.isNaN(date.getTime()) &&
                date.toISOString().slice(0, 10) === goal.deadline
        }

        const goalWithInvalidDeadline = selectedGoals.find(goal => !validDate(goal))
        if (goalWithInvalidDeadline) {
            setError(`Please choose a valid deadline for "${goalWithInvalidDeadline.title}".`)
            return
        }

        setSaving(true)
        setError("")

        try {
            await api.post("/api/goals/choose", {
                goals: selectedGoals.map(goal => ({
                    category: goal.category.trim(),
                    title: goal.title.trim(),
                    description: goal.description.trim(),
                    dailyAction: goal.dailyAction.trim(),
                    deadline: goal.deadline
                }))
            })

            navigate("/dashboard")
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Something went wrong while saving your goals. Please try again."
            )
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#080808] text-white">
                Loading goals...
            </div>
        )
    }

    return (
        <AppPage className="bg-[#080808] text-white">
        <div className="px-4 py-10 md:py-16">
            {/* Narrower container for better proportions */}
            <div className="max-w-3xl mx-auto">

                <div className="text-center mb-10">
                    <p className="text-xs tracking-[0.2em] text-[#A3A3A3] mb-3 uppercase">
                        Future You
                    </p>
                    <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
                        Choose Your Goals
                    </h1>
                    <p className="text-[#A3A3A3] text-sm max-w-md mx-auto">
                        Choose the goals you want to work toward. Every small step brings you closer.
                    </p>
                </div>

                <div className="flex items-center justify-between mb-4 px-1">
                    <p className="text-[#A3A3A3] text-sm">
                        Select your goals
                    </p>
                    <p className="text-white text-sm font-medium">
                        {selectedGoals.length} selected
                    </p>
                </div>

                {error && (
                    <div className="bg-[#111111] border border-[#303030] text-white text-sm rounded-lg p-3 mb-5">
                        {error}
                    </div>
                )}

                {/* Tighter grid with better responsive behavior */}
                <div className="grid sm:grid-cols-2 gap-3">
                    {goals.map((goal, index) => {
                        const selected = isSelected(goal)

                        return (
                            <div
                                key={`${goal.category}-${goal.title}-${index}`}
                                className={`text-left p-4 rounded-xl border transition-all duration-200 flex flex-col ${
                                    selected
                                        ? "border-white bg-[#171717]"
                                        : "border-[#303030] bg-[#111111] hover:border-[#555]"
                                }`}
                            >
                                <button
                                    type="button"
                                    onClick={() => toggleGoal(goal)}
                                    aria-pressed={selected}
                                    className="w-full text-left flex-grow"
                                >
                                    <div className="flex justify-between items-start gap-2 mb-3">
                                        <span className="text-[10px] uppercase tracking-wider text-[#A3A3A3]">
                                            {goal.category}
                                        </span>

                                        <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs shrink-0 ${
                                            selected
                                                ? "bg-white border-white text-black"
                                                : "border-[#303030] text-transparent"
                                        }`}>
                                            ✓
                                        </span>
                                    </div>

                                    <h2 className="text-lg font-semibold mb-2 leading-snug">
                                        {goal.title}
                                    </h2>

                                    <p className="text-[#A3A3A3] text-sm mb-4 line-clamp-3">
                                        {goal.description}
                                    </p>

                                    <div className="border-t border-[#303030] pt-3 mt-auto">
                                        <p className="text-[10px] text-[#A3A3A3] mb-1 uppercase tracking-wider">
                                            Daily Action
                                        </p>
                                        <p className="text-sm text-[#A3A3A3] line-clamp-2">
                                            {goal.dailyAction}
                                        </p>
                                    </div>
                                </button>

                                {selected && (
                                    <div className="mt-4 pt-4 border-t border-[#303030]">
                                        <label
                                            htmlFor={`deadline-${index}`}
                                            className="block text-[10px] uppercase tracking-wider text-[#A3A3A3] mb-2"
                                        >
                                            Deadline (required)
                                        </label>
                                        <input
                                            id={`deadline-${index}`}
                                            type="date"
                                            required
                                            value={selectedGoals.find(item =>
                                                item.category === goal.category &&
                                                item.title === goal.title
                                            )?.deadline || ""}
                                            onChange={event => updateGoalDeadline(goal, event.target.value)}
                                            className="w-full rounded-md border border-[#303030] bg-[#080808] px-3 py-2 text-sm text-white focus:border-white focus:outline-none [color-scheme:dark]"
                                        />
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                {goals.length === 0 && (
                    <p className="text-center text-[#A3A3A3] text-sm py-10">
                        No goals are available right now.
                    </p>
                )}

                <div className="flex justify-center mt-10">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={selectedGoals.length === 0 || saving}
                        className="px-8 py-3 rounded-full bg-white text-black text-sm font-semibold transition hover:bg-[#A3A3A3] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {saving ? "Saving..." : "Continue"}
                    </button>
                </div>

            </div>
        </div>
        </AppPage>
    )
}

export default Goals