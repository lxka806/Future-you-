import { useEffect, useState } from "react"
import AppPage from "../components/AppPage"
import api from "../services/api"

function DailyMotivation() {
    const [motivations, setMotivations] = useState([])
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        let active = true
        api.get("/api/daily-motivation")
            .then(response => {
                if (active) setMotivations(response.data.motivations || [])
            })
            .catch(error => {
                if (active) {
                    setError(error.response?.data?.message || "Failed to load your motivation.")
                }
            })
            .finally(() => {
                if (active) setLoading(false)
            })

        return () => {
            active = false
        }
    }, [])

    const generateMotivation = async () => {
        setGenerating(true)
        setError("")
        try {
            const response = await api.post("/api/daily-motivation/generate")
            setMotivations(previous => [
                response.data.motivation,
                ...previous.filter(item => item._id !== response.data.motivation._id)
            ])
        } catch (error) {
            setError(error.response?.data?.message || "Failed to generate daily motivation.")
        } finally {
            setGenerating(false)
        }
    }

    const today = new Date().toISOString().slice(0, 10)
    const todayMotivation = motivations.find(item => item.date === today)

    return (
        // Removed padding from AppPage to allow full-bleed snapping on mobile
        <AppPage className="bg-[#080808] text-white">
            
            {/* 
                MOBILE VIEW (TikTok Style)
                - Visible only on small screens (block md:hidden)
                - Height is calculated to subtract the mobile header/sidebar if you have one (100dvh is dynamic viewport height)
                - snap-y snap-mandatory forces the scroll to snap to cards
            */}
            <div className="block md:hidden h-[100dvh] w-full overflow-y-auto snap-y snap-mandatory scroll-smooth custom-scrollbar relative">
                
                {loading ? (
                    <div className="flex h-full items-center justify-center">
                        <p className="text-[#A3A3A3]">Loading...</p>
                    </div>
                ) : motivations.length === 0 ? (
                    <div className="flex h-full items-center justify-center p-6 text-center">
                        <div>
                            <h2 className="mb-2 text-xl font-semibold">Your first message is waiting</h2>
                            <p className="text-[#A3A3A3] mb-6 text-sm">Generate a personal message based on your goals.</p>
                            <button
                                onClick={generateMotivation}
                                disabled={generating}
                                className="rounded-full bg-white px-8 py-3 font-semibold text-black transition hover:bg-gray-200 disabled:opacity-50"
                            >
                                {generating ? "Generating..." : "Generate Now"}
                            </button>
                        </div>
                    </div>
                ) : (
                    motivations.map(motivation => (
                        <div 
                            key={motivation._id} 
                            className="h-full w-full snap-start snap-always flex flex-col justify-center p-6 relative"
                        >
                            {/* Subtle background accent */}
                            <div className="absolute inset-0 bg-gradient-to-b from-[#171717] to-[#080808] -z-10 opacity-50" />
                            
                            <div className="mb-6 flex items-center justify-between">
                                <span className="text-xs font-semibold tracking-wider text-[#A3A3A3] uppercase">
                                    {motivation.date === today ? "Today's Motivation" : new Date(motivation.date).toLocaleDateString()}
                                </span>
                                <span className="text-2xl text-[#303030]">”</span>
                            </div>
                            
                            <p className="text-3xl font-medium leading-snug tracking-tight text-white/90">
                                {motivation.content}
                            </p>
                            
                            {/* Swipe indicator */}
                            <div className="absolute bottom-10 left-0 right-0 flex justify-center animate-bounce opacity-50">
                                <span className="text-xs text-[#A3A3A3]">Swipe up for more</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* 
                DESKTOP VIEW (Standard Layout)
                - Hidden on mobile (hidden md:block)
            */}
            <div className="hidden md:block px-10 py-10 max-w-4xl mx-auto">
                <header className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-[#222222] pb-8">
                    <div>
                        <p className="mb-2 text-xs tracking-[0.2em] uppercase text-[#A3A3A3] font-semibold">Your Future</p>
                        <h1 className="text-3xl font-bold">Daily Motivation</h1>
                        <p className="mt-2 text-[#A3A3A3] text-sm">A reminder of what you are building, one day at a time.</p>
                    </div>
                    <button
                        type="button"
                        onClick={generateMotivation}
                        disabled={generating || Boolean(todayMotivation)}
                        className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-gray-200 disabled:opacity-50"
                    >
                        {generating ? "Generating..." : todayMotivation ? "Today's message is ready" : "Get today's motivation"}
                    </button>
                </header>

                {error && <p role="alert" className="mb-6 rounded-xl border border-[#303030] bg-[#222222] p-4 text-white">{error}</p>}

                {loading ? (
                    <p className="text-[#A3A3A3]">Loading your messages...</p>
                ) : motivations.length === 0 ? (
                    <section className="rounded-2xl border border-[#303030] bg-[#171717] p-8 text-center">
                        <h2 className="mb-2 text-xl font-semibold">Your first message is waiting</h2>
                        <p className="text-[#A3A3A3]">Generate a personal message based on your goals and recent progress.</p>
                    </section>
                ) : (
                    <div className="space-y-5">
                        {motivations.map(motivation => (
                            <article key={motivation._id} className="rounded-2xl border border-[#303030] bg-[#171717] p-7 hover:border-[#A3A3A3] transition-colors">
                                <p className="mb-3 text-xs uppercase tracking-wider text-[#A3A3A3]">
                                    {motivation.date === today ? "Today's motivation" : new Date(motivation.date).toLocaleDateString()}
                                </p>
                                <p className="whitespace-pre-line text-lg leading-relaxed text-white/90">{motivation.content}</p>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </AppPage>
    )
}

export default DailyMotivation