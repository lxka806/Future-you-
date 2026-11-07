import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import AppPage from "../components/AppPage"
import api from "../services/api"

function Journal() {
    const { journalId } = useParams()
    const navigate = useNavigate()
    const [entries, setEntries] = useState([])
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")
    const [message, setMessage] = useState("")

    useEffect(() => {
        let active = true
        const loadEntries = async () => {
            setError("")
            setMessage("")
            try {
                const response = await api.get("/api/journal")
                if (!active) return
                const loadedEntries = response.data.journals || []
                setEntries(loadedEntries)

                if (!journalId || journalId === "new") {
                    setTitle("")
                    setContent("")
                } else {
                    const selectedEntry = await api.get(`/api/journal/${journalId}`)
                    if (active) {
                        setTitle(selectedEntry.data.journal.title)
                        setContent(selectedEntry.data.journal.content)
                    }
                }
            } catch (loadError) {
                if (active) {
                    setError(loadError.response?.data?.message || "Failed to load your journal.")
                }
            } finally {
                if (active) setLoading(false)
            }
        }

        loadEntries()
        return () => {
            active = false
        }
    }, [journalId])

    const saveEntry = async event => {
        event.preventDefault()
        setSaving(true)
        setError("")
        setMessage("")
        try {
            const payload = { title: title.trim(), content: content.trim() }
            const response = journalId && journalId !== "new"
                ? await api.put(`/api/journal/${journalId}`, payload)
                : await api.post("/api/journal", payload)
            const savedEntry = response.data.journal
            setEntries(previous => [
                savedEntry,
                ...previous.filter(entry => entry._id !== savedEntry._id)
            ])
            setMessage("Journal entry saved.")
            if (!journalId || journalId === "new") {
                navigate(`/journal/${savedEntry._id}`)
            }
        } catch (saveError) {
            setError(saveError.response?.data?.message || "Failed to save your journal entry.")
        } finally {
            setSaving(false)
        }
    }

    const deleteEntry = async () => {
        if (!journalId || journalId === "new") return
        setError("")
        setMessage("")
        try {
            await api.delete(`/api/journal/${journalId}`)
            setEntries(previous => previous.filter(entry => entry._id !== journalId))
            setTitle("")
            setContent("")
            navigate("/journal")
            setMessage("Journal entry deleted.")
        } catch (deleteError) {
            setError(deleteError.response?.data?.message || "Failed to delete your journal entry.")
        }
    }

    const selectedId = journalId && journalId !== "new" ? journalId : null

    return (
        <AppPage className="bg-[#080808] text-white">
            <div className="p-6 md:p-10 max-w-6xl mx-auto">
                
                {/* HEADER */}
                <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#222222] pb-8">
                    <div>
                        <p className="mb-2 text-xs tracking-[0.2em] uppercase text-[#A3A3A3] font-semibold">
                            Your Space
                        </p>
                        <h1 className="text-3xl font-bold">Journal</h1>
                        <p className="mt-2 text-[#A3A3A3]">
                            Write, save, and revisit your thoughts.
                        </p>
                    </div>
                    <Link
                        to="/journal/new"
                        className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-[#A3A3A3] shrink-0"
                    >
                        + New Entry
                    </Link>
                </header>

                {/* STATUS MESSAGES (Monochrome) */}
                {error && (
                    <div role="alert" className="mb-5 rounded-xl border border-[#303030] bg-[#222222] p-4 text-white">
                        {error}
                    </div>
                )}
                {message && (
                    <div role="status" className="mb-5 rounded-xl border border-[#303030] bg-[#171717] p-4 text-[#A3A3A3]">
                        {message}
                    </div>
                )}

                {loading ? (
                    <p className="text-[#A3A3A3]">Loading your journal...</p>
                ) : (
                    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                        
                        {/* SIDEBAR LIST */}
                        <section className="rounded-2xl border border-[#303030] bg-[#171717] p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold">Saved Entries</h2>
                                <span className="text-xs text-[#A3A3A3] bg-[#222222] px-2 py-1 rounded-md">
                                    {entries.length}
                                </span>
                            </div>
                            
                            {entries.length === 0 ? (
                                <p className="text-sm text-[#A3A3A3]">Your saved entries will appear here.</p>
                            ) : (
                                <ul className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                    {entries.map(entry => (
                                        <li key={entry._id}>
                                            <Link
                                                to={`/journal/${entry._id}`}
                                                className={`block rounded-xl border p-4 transition ${
                                                    selectedId === entry._id
                                                        ? "border-[#A3A3A3] bg-[#222222]"
                                                        : "border-[#303030] bg-[#080808] hover:bg-[#222222]"
                                                }`}
                                            >
                                                <span className="block font-medium text-white truncate">
                                                    {entry.title}
                                                </span>
                                                <span className="mt-1 block text-xs text-[#A3A3A3]">
                                                    {new Date(entry.updatedAt).toLocaleDateString('en-US', { 
                                                        month: 'short', 
                                                        day: 'numeric',
                                                        hour: 'numeric',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                                <span className="mt-3 block line-clamp-2 text-sm text-[#A3A3A3]">
                                                    {entry.content}
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>

                        {/* WRITING AREA */}
                        <form onSubmit={saveEntry} className="rounded-2xl border border-[#303030] bg-[#171717] p-5 md:p-8">
                            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                                <h2 className="text-lg font-semibold">
                                    {selectedId ? "Edit Entry" : "New Entry"}
                                </h2>
                                {selectedId && (
                                    <button
                                        type="button"
                                        onClick={deleteEntry}
                                        className="rounded-lg border border-[#303030] px-3 py-1.5 text-xs text-[#A3A3A3] transition hover:border-[#A3A3A3] hover:text-white"
                                    >
                                        Delete Entry
                                    </button>
                                )}
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label htmlFor="journal-title" className="mb-2 block text-sm text-[#A3A3A3] font-medium">
                                        Title
                                    </label>
                                    <input
                                        id="journal-title"
                                        value={title}
                                        onChange={event => setTitle(event.target.value)}
                                        maxLength={120}
                                        required
                                        placeholder="Give this entry a title"
                                        className="w-full rounded-lg border border-[#303030] bg-[#080808] px-4 py-3 text-white placeholder-[#555] outline-none transition focus:border-[#A3A3A3]"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="journal-content" className="mb-2 block text-sm text-[#A3A3A3] font-medium">
                                        Entry
                                    </label>
                                    <textarea
                                        id="journal-content"
                                        value={content}
                                        onChange={event => setContent(event.target.value)}
                                        maxLength={20000}
                                        required
                                        rows={16}
                                        placeholder="Write whatever is on your mind..."
                                        className="w-full resize-y rounded-lg border border-[#303030] bg-[#080808] px-4 py-4 text-white placeholder-[#555] outline-none transition focus:border-[#A3A3A3] leading-relaxed"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-between">
                                <span className="text-xs text-[#A3A3A3]">
                                    {content.length} characters
                                </span>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-lg bg-white px-6 py-2.5 font-semibold text-black transition hover:bg-[#A3A3A3] disabled:opacity-50"
                                >
                                    {saving ? "Saving..." : selectedId ? "Save Changes" : "Save Entry"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </AppPage>
    )
}

export default Journal