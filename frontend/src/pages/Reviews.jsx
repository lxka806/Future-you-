import { useEffect, useState } from "react"

const reviewsApi = import.meta.env.VITE_REVIEW_API_URL || "https://future-you-1.onrender.com/api/reviews"

const readApiResponse = async response => {
    const body = await response.text()
    let data = {}

    if (body) {
        try {
            data = JSON.parse(body)
        } catch {
            data = {}
        }
    }

    if (!response.ok) {
        if (response.status === 502 || response.status === 503) {
            throw new Error("The reviews service is unavailable. Start the infobakcend server and try again.")
        }
        throw new Error(data.message || `Request failed (${response.status})`)
    }

    return data
}

function Reviews() {
    const [reviews, setReviews] = useState([])
    const [name, setName] = useState("")
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState("")
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState("")
    const [message, setMessage] = useState("")

    useEffect(() => {
        let active = true
        fetch(reviewsApi)
            .then(readApiResponse)
            .then(data => {
                if (active) setReviews(data.reviews || [])
            })
            .catch(fetchError => {
                if (active) setError(fetchError.message || "Could not load reviews")
            })
            .finally(() => {
                if (active) setLoading(false)
            })

        return () => {
            active = false
        }
    }, [])

    const submitReview = async event => {
        event.preventDefault()
        setSubmitting(true)
        setError("")
        setMessage("")

        try {
            const response = await fetch(reviewsApi, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, rating, comment })
            })
            const data = await readApiResponse(response)

            setReviews(previous => [data.review, ...previous].slice(0, 100))
            setName("")
            setRating(0)
            setComment("")
            setMessage(data.message || "Thank you for sharing your review.")
        } catch (submitError) {
            setError(submitError.message || "Could not submit your review")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <section id="reviews" className="scroll-mt-20 bg-black px-5 py-20 text-white sm:px-8 sm:py-24 md:px-12 lg:px-20 lg:py-28">
            <div className="mx-auto grid max-w-7xl gap-9 sm:gap-12 lg:grid-cols-[0.8fr_1.2fr]">
                <div>
                    <p className="mb-4 text-xs tracking-[0.2em] text-gray-500 sm:mb-5 sm:text-sm sm:tracking-[5px]">06 — COMMUNITY</p>
                    <h2 className="mb-5 text-3xl font-black leading-tight min-[420px]:text-4xl sm:text-5xl">
                        SHARE YOUR
                        <br />
                        EXPERIENCE.
                    </h2>
                    <p className="max-w-md text-sm leading-relaxed text-gray-400 sm:text-base">
                        Have you started building your future with us? Leave a review and help others take their first step.
                    </p>

                    <form onSubmit={submitReview} className="mt-8 space-y-5">
                        <div>
                            <label htmlFor="review-name" className="mb-2 block text-sm text-gray-300">Your name</label>
                            <input
                                id="review-name"
                                value={name}
                                onChange={event => setName(event.target.value)}
                                maxLength={60}
                                required
                                autoComplete="name"
                                className="w-full rounded-lg border border-white/20 bg-black px-4 py-3 text-white outline-none transition focus:border-white"
                                placeholder="Name"
                            />
                        </div>

                        <fieldset>
                            <legend className="mb-2 text-sm text-gray-300">Your rating</legend>
                            <div className="flex gap-1 sm:gap-2" role="radiogroup" aria-label="Rating">
                                {[1, 2, 3, 4, 5].map(value => (
                                    <button
                                        key={value}
                                        type="button"
                                        role="radio"
                                        aria-checked={rating === value}
                                        aria-label={`${value} star${value === 1 ? "" : "s"}`}
                                        onClick={() => setRating(value)}
                                        className={`text-2xl transition sm:text-3xl ${value <= rating ? "text-white" : "text-gray-600 hover:text-gray-300"}`}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>
                        </fieldset>

                        <div>
                            <label htmlFor="review-comment" className="mb-2 block text-sm text-gray-300">Your review</label>
                            <textarea
                                id="review-comment"
                                value={comment}
                                onChange={event => setComment(event.target.value)}
                                maxLength={1200}
                                required
                                rows={5}
                                className="w-full resize-y rounded-lg border border-white/20 bg-black px-4 py-3 text-white outline-none transition focus:border-white"
                                placeholder="Tell us what you think..."
                            />
                            <p className="mt-1 text-right text-xs text-gray-500">{comment.length}/1200</p>
                        </div>

                        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
                        {message && <p role="status" className="text-sm text-green-300">{message}</p>}

                        <button
                            type="submit"
                            disabled={submitting || rating === 0}
                            className="rounded-full bg-white px-7 py-3 font-bold text-black transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {submitting ? "SUBMITTING..." : "SUBMIT REVIEW"}
                        </button>
                    </form>
                </div>

                <div>
                    <div className="mb-6 flex items-end justify-between border-b border-white/20 pb-4">
                        <div>
                            <p className="mb-2 text-sm tracking-[3px] text-gray-500">REAL STORIES</p>
                            <h3 className="text-xl font-bold sm:text-2xl">Community Reviews</h3>
                        </div>
                        <span className="text-sm text-gray-500">{reviews.length} review{reviews.length === 1 ? "" : "s"}</span>
                    </div>

                    {loading ? (
                        <p className="py-8 text-gray-400">Loading reviews...</p>
                    ) : reviews.length === 0 ? (
                        <p className="py-8 text-gray-400">No reviews yet. Be the first to share your experience.</p>
                    ) : (
                        <div className="max-h-[650px] space-y-3 overflow-y-auto pr-1 sm:space-y-4 sm:pr-2">
                            {reviews.map(review => (
                                <article key={review._id} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <h4 className="font-bold">{review.name}</h4>
                                        <span className="text-lg tracking-wider text-white" aria-label={`${review.rating} out of 5 stars`}>
                                            {"★".repeat(review.rating)}<span className="text-gray-700">{"★".repeat(5 - review.rating)}</span>
                                        </span>
                                    </div>
                                    <p className="mt-3 whitespace-pre-wrap leading-relaxed text-gray-300">{review.comment}</p>
                                    <time className="mt-4 block text-xs text-gray-500" dateTime={review.createdAt}>
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </time>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}

export default Reviews
