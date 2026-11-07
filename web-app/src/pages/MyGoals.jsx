import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import AppPage from "../components/AppPage"
import api from "../services/api"

function MyGoals() {
    const [goals, setGoals] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const fetchGoals = async () => {
            try {
                const response = await api.get("/api/goals/myGoals")
                setGoals(response.data.goals || [])
            } catch (error) {
                setError(error.response?.data?.message || "Failed to load your goals.")
            } finally {
                setLoading(false)
            }
        }

        fetchGoals()
    }, [])

    return (
        <AppPage className="bg-[#080808] px-10 py-10 text-white">
            <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="mb-2 text-sm tracking-widest text-[#A3A3A3]">YOUR JOURNEY</p>
                    <h1 className="text-3xl font-bold">My Goals</h1>
                    <p className="mt-2 text-[#A3A3A3]">Keep track of what you are working toward.</p>
                </div>
                <Link
                    to="/goals"
                    className="rounded-lg bg-white px-5 py-3 font-semibold text-black transition hover:bg-gray-200"
                >
                    Choose goals
                </Link>
            </header>

            {error && (
                <p role="alert" className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
                    {error}
                </p>
            )}

            {loading ? (
                <p className="text-[#A3A3A3]">Loading your goals...</p>
            ) : goals.length === 0 ? (
                <section className="rounded-2xl border border-[#303030] bg-[#171717] p-8 text-center">
                    <h2 className="mb-2 text-xl font-semibold">No goals yet</h2>
                    <p className="mb-5 text-[#A3A3A3]">Choose a goal to start building your future.</p>
                    <Link to="/goals" className="font-semibold underline">Browse goals</Link>
                </section>
            ) : (
                <div className="grid gap-5 lg:grid-cols-2">
                    {goals.map(goal => (
                        <article key={goal._id} className="rounded-2xl border border-[#303030] bg-[#171717] p-6">
                            <p className="mb-2 text-xs uppercase tracking-wider text-[#A3A3A3]">{goal.category}</p>
                            <div className="mb-4 flex items-start justify-between gap-4">
                                <h2 className="text-xl font-semibold">{goal.title}</h2>
                                <span className="rounded-full bg-[#222222] px-3 py-1 text-xs capitalize text-[#A3A3A3]">
                                    {goal.status}
                                </span>
                            </div>
                            <p className="mb-5 text-sm text-[#A3A3A3]">{goal.description}</p>
                            <p className="text-sm"><span className="text-[#A3A3A3]">Daily action: </span>{goal.dailyAction}</p>
                            <p className="mt-3 text-sm text-[#A3A3A3]">
                                Deadline: {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : "Not set"}
                            </p>
                        </article>
                    ))}
                </div>
            )}
        </AppPage>
    )
}

export default MyGoals
