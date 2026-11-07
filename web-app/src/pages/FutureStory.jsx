import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import AppPage from "../components/AppPage"
import api from "../services/api"

function FutureStory() {
    const { storyId } = useParams()
    const navigate = useNavigate()
    const [stories, setStories] = useState([])
    const [story, setStory] = useState(null)
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        const loadStories = async () => {
            setLoading(true)
            setError("")
            try {
                const response = await api.get("/api/future-stories")
                setStories(response.data.stories || [])

                if (storyId) {
                    const detail = await api.get(`/api/future-stories/${storyId}`)
                    setStory(detail.data.story)
                } else {
                    setStory(null)
                }
            } catch (error) {
                setError(error.response?.data?.message || "Failed to load your future stories.")
                setStory(null)
            } finally {
                setLoading(false)
            }
        }

        loadStories()
    }, [storyId])

    const generateStory = async () => {
        setGenerating(true)
        setError("")
        try {
            const response = await api.post("/api/future-stories/generate")
            setStories(previous => [response.data.story, ...previous])
            navigate(`/stories/${response.data.story._id}`)
        } catch (error) {
            setError(error.response?.data?.message || "Failed to generate a future story.")
        } finally {
            setGenerating(false)
        }
    }

    const deleteStory = async (id) => {
        setError("")
        try {
            await api.delete(`/api/future-stories/${id}`)
            setStories(previous => previous.filter(item => item._id !== id))
            if (storyId === id) navigate("/stories")
        } catch (error) {
            setError(error.response?.data?.message || "Failed to delete this story.")
        }
    }

    // Calculate reading time (approx 200 words per minute)
    const getReadingTime = (content) => {
        if (!content) return "0 min read"
        const words = content.trim().split(/\s+/).length
        const minutes = Math.ceil(words / 200)
        return `${minutes} min read`
    }

    return (
        <AppPage className="bg-[#080808] text-white">
            <div className="p-6 md:p-10 max-w-5xl mx-auto">
                
                {/* HEADER (Only show if looking at the list) */}
                {!storyId && (
                    <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#222222] pb-8">
                        <div>
                            <p className="mb-2 text-xs tracking-[0.2em] uppercase text-[#A3A3A3] font-semibold">
                                Your Future
                            </p>
                            <h1 className="text-3xl font-bold">Future Stories</h1>
                            <p className="mt-2 text-[#A3A3A3]">
                                Picture the future you are creating through your daily choices.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={generateStory}
                            disabled={generating}
                            className="rounded-lg bg-white px-6 py-3 font-semibold text-black transition hover:bg-[#A3A3A3] disabled:opacity-50 shrink-0"
                        >
                            {generating ? "Writing your story..." : "+ Generate a story"}
                        </button>
                    </header>
                )}

                {/* ERROR */}
                {error && (
                    <div className="mb-6 rounded-xl border border-[#303030] bg-[#222222] p-4 text-white">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="py-20 text-center text-[#A3A3A3]">
                        <p>Loading your stories...</p>
                    </div>
                ) : storyId && story ? (
                    /* SINGLE STORY VIEW (The "Book" layout) */
                    <div className="max-w-3xl mx-auto">
                        <div className="mb-6 flex items-center justify-between">
                            <Link 
                                to="/stories" 
                                className="inline-flex items-center gap-2 text-sm text-[#A3A3A3] hover:text-white transition group"
                            >
                                <span className="group-hover:-translate-x-1 transition-transform">←</span> All stories
                            </Link>
                            <button
                                type="button"
                                onClick={() => deleteStory(story._id)}
                                className="rounded-lg border border-[#303030] px-3 py-1.5 text-xs text-[#A3A3A3] hover:bg-[#222222] hover:text-white transition"
                            >
                                Delete story
                            </button>
                        </div>

                        <article className="rounded-3xl border border-[#303030] bg-[#171717] p-8 md:p-14 relative overflow-hidden">
                            {/* Subtle top gradient accent */}
                            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#222222]/50 to-transparent pointer-events-none" />
                            
                            <div className="relative z-10 text-center mb-12">
                                <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight leading-tight">
                                    {story.title}
                                </h2>
                                <div className="flex items-center justify-center gap-3 text-xs text-[#A3A3A3] uppercase tracking-wider">
                                    <span>{new Date(story.generatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                    <span>•</span>
                                    <span>{getReadingTime(story.content)}</span>
                                </div>
                            </div>
                            
                            {/* The content with a drop-cap on the first letter */}
                            <div className="relative z-10">
                                <p className="text-[#E5E5E5] text-lg leading-[1.9] whitespace-pre-line first-letter:text-6xl first-letter:font-bold first-letter:text-white first-letter:mr-3 first-letter:float-left first-letter:mt-1">
                                    {story.content}
                                </p>
                            </div>
                        </article>
                    </div>
                ) : stories.length === 0 ? (
                    /* EMPTY STATE */
                    <section className="rounded-3xl border border-[#303030] bg-[#171717] p-12 text-center max-w-2xl mx-auto mt-10">
                        <div className="w-16 h-16 rounded-full bg-[#222222] flex items-center justify-center mx-auto mb-6 text-2xl">
                            ✧
                        </div>
                        <h2 className="mb-3 text-2xl font-semibold">Your future story starts with your goals</h2>
                        <p className="text-[#A3A3A3] mb-8">
                            Generate a story to imagine where your steady progress can take you. 
                            It's like receiving a letter from your future self.
                        </p>
                        <button
                            type="button"
                            onClick={generateStory}
                            disabled={generating}
                            className="rounded-full bg-white px-8 py-3 font-semibold text-black transition hover:bg-[#A3A3A3] disabled:opacity-50"
                        >
                            {generating ? "Writing your story..." : "Generate your first story"}
                        </button>
                    </section>
                ) : (
                    /* LIST VIEW */
                    <div className="grid gap-5 md:grid-cols-2">
                        {stories.map(item => (
                            <Link 
                                key={item._id} 
                                to={`/stories/${item._id}`} 
                                className="group rounded-2xl border border-[#303030] bg-[#171717] p-6 hover:border-[#A3A3A3] hover:bg-[#1a1a1a] transition-all flex flex-col"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-[10px] uppercase tracking-wider text-[#A3A3A3] bg-[#222222] px-2.5 py-1 rounded">
                                        Story
                                    </span>
                                    <span className="text-[#A3A3A3] text-xs">
                                        {getReadingTime(item.content)}
                                    </span>
                                </div>
                                
                                <h3 className="text-xl font-semibold mb-2 group-hover:text-white transition-colors line-clamp-2">
                                    {item.title}
                                </h3>
                                
                                <p className="text-sm text-[#A3A3A3] mb-6 line-clamp-3 flex-1">
                                    {item.content}
                                </p>
                                
                                <div className="flex items-center justify-between text-xs text-[#A3A3A3] mt-auto pt-4 border-t border-[#303030]">
                                    <span>
                                        {new Date(item.generatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                    <span className="group-hover:text-white transition-colors flex items-center gap-1">
                                        Read story <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AppPage>
    )
}

export default FutureStory