
const API_URL = "https://api.groq.com/openai/v1/chat/completions"
const REQUEST_TIMEOUT_MS = 30000
const MAX_COMPLETION_TOKENS = 1600

const createServiceError = (message, statusCode) => {
    const error = new Error(message)
    error.statusCode = statusCode
    return error
}

const getProviderErrorMessage = (body) => {
    if (!body || typeof body !== "object") return null

    const error = body.error
    const message = typeof error === "string"
        ? error
        : error?.message || body.message || body.detail

    return typeof message === "string" ? message.slice(0, 500) : null
}

const generateFutureStory = async ({ username, progress }) => {
    const apiKey = process.env.GROQ_API_KEY

    if (!apiKey) {
        throw createServiceError("Groq AI is not configured. Set GROQ_API_KEY in the backend environment.", 503)
    }

    if (!username || !progress || !Array.isArray(progress.goals) || progress.goals.length === 0) {
        throw createServiceError("Valid user and goal progress are required", 400)
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
                messages: [
                    {
                        role: "system",
                        
                content: [
                    "Write a vivid, realistic first-person diary entry titled",
                    '"A Day in the Life of Your Future Self".',
                    "Imagine the user several years in the future, after they have successfully achieved their personal goals.",
                    "Write as if the user is already living that future life, not trying to reach it.",
                    "Describe one complete, specific day, from waking up in the morning until going to sleep at night.",
                    "Use first-person perspective, writing with 'I' and 'my'.",
                    "Show how the user's achieved goals have transformed their everyday lifestyle, opportunities, routines, and experiences.",
                    "Turn each relevant goal into realistic details within the user's future daily life.",
                    "If the user wants a particular career, describe them already working in that career.",
                    "If the user wants financial success, reflect their desired financial lifestyle without inventing specific wealth.",
                    "If the user wants to travel, include realistic travel experiences where relevant.",
                    "Use the supplied profile and goals as inspiration, but do not invent unsupported personal facts.",
                    "Do not invent specific relationships, family members, locations, employers, or personal circumstances.",
                    "Do not describe the user struggling to achieve their goals or completing unfinished tasks.",
                    "The story should feel like a normal day in a successful future, not an exaggerated fantasy.",
                    "Include specific times, natural conversations where appropriate, realistic situations, and sensory details.",
                    "Avoid generic motivational quotes, repetitive phrases, and unrealistic success stories.",
                    "Make the story personal, immersive, emotionally meaningful, and believable.",
                    "This is an imaginative possible future, not a prediction or guarantee.",
                    "Return only the diary entry body, without a title heading or commentary."
                ].join(" ")
                    },
                    {
                        role: "user",
                        content: JSON.stringify({
                            username,
                            progress
                        })
                    }
                ],
                temperature: 0.8,
                max_completion_tokens: MAX_COMPLETION_TOKENS
            }),
            signal: controller.signal
        })

        if (!response.ok) {
            const responseBody = await response.text()
            let errorBody

            try {
                errorBody = JSON.parse(responseBody)
            } catch {
                errorBody = null
            }

            const providerMessage = getProviderErrorMessage(errorBody) ||
                responseBody.trim().slice(0, 500) ||
                "No error details were returned"

            const requestId = response.headers.get("request-id") ||
                response.headers.get("x-request-id")

            console.error("AI provider request failed", {
                status: response.status,
                message: providerMessage,
                requestId
            })

            throw createServiceError(`AI story generation failed: ${providerMessage}`, 502)
        }

        let data

        try {
            data = await response.json()
        } catch {
            throw createServiceError("AI service returned an invalid response", 502)
        }

        const content = data.choices?.[0]?.message?.content?.trim()

        if (!content) {
            throw createServiceError("AI service returned an empty story", 502)
        }

        return content

    } catch (e) {
        if (e.name === "AbortError") {
            throw createServiceError("AI story generation timed out; please try again", 504)
        }

        if (e.statusCode) throw e

        console.error("AI provider connection failed", e)
        throw createServiceError("Could not connect to the AI service", 502)

    } finally {
        clearTimeout(timeout)
    }
}

const generateDailyMotivation = async ({ username, progress }) => {
    if (!username || !progress || !Array.isArray(progress.goals) || progress.goals.length === 0) {
        throw createServiceError("Valid user and goal progress are required", 400)
    }

    const systemPrompt = [
        "You are the daily motivation assistant for Future You.",
        "Generate one short, powerful, personalized daily motivational message.",
        "Use the user's goals and recent progress to make the message relevant.",
        "Acknowledge their progress when appropriate.",
        "If progress is low, encourage them without making them feel guilty.",
        "Focus on consistency, discipline, patience, and meaningful action.",
        "Avoid generic motivational quotes and clichés.",
        "Never invent personal achievements or facts.",
        "Do not promise guaranteed success.",
        "Keep the message natural, emotionally engaging, and personal.",
        "Write 2-4 sentences maximum.",
        "Return only the motivational message, without headings or explanations."
    ].join(" ")

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
        throw createServiceError("Groq AI is not configured. Set GROQ_API_KEY in the backend environment.", 503)
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + apiKey
            },
            body: JSON.stringify({
                model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
                messages: [
                    { role: "system", content: systemPrompt },
                    {
                        role: "user",
                        content: JSON.stringify({ username, progress })
                    }
                ],
                temperature: 0.8,
                reasoning_effort: "low",
                reasoning_format: "hidden",
                max_completion_tokens: 512
            }),
            signal: controller.signal
        })

        if (!response.ok) {
            const responseBody = await response.text()
            let errorBody
            try {
                errorBody = JSON.parse(responseBody)
            } catch {
                errorBody = null
            }

            const providerMessage = getProviderErrorMessage(errorBody) ||
                responseBody.trim().slice(0, 500) ||
                "No error details were returned"
            const requestId = response.headers.get("request-id") ||
                response.headers.get("x-request-id")

            console.error("Groq provider request failed", {
                feature: "daily motivation",
                status: response.status,
                message: providerMessage,
                requestId
            })
            throw createServiceError(`AI daily motivation generation failed: ${providerMessage}`, 502)
        }

        let data
        try {
            data = await response.json()
        } catch {
            throw createServiceError("AI service returned an invalid response", 502)
        }

        const choice = data.choices?.[0]
        const messageContent = choice?.message?.content
        const content = typeof messageContent === "string"
            ? messageContent.trim()
            : Array.isArray(messageContent)
                ? messageContent
                    .filter(part => part.type === "text" && typeof part.text === "string")
                    .map(part => part.text)
                    .join("")
                    .trim()
                : ""

        if (!content) {
            console.error("Groq returned no visible daily motivation", {
                finishReason: choice?.finish_reason || null,
                usage: data.usage || null,
                messageFields: choice?.message ? Object.keys(choice.message) : []
            })
            throw createServiceError(
                `AI service returned no visible motivation${choice?.finish_reason ? ` (finish reason: ${choice.finish_reason})` : ""}`,
                502
            )
        }

        return content
    } catch (e) {
        if (e.name === "AbortError") {
            throw createServiceError("AI motivation generation timed out; please try again", 504)
        }
        if (e.statusCode) throw e

        console.error("Groq provider connection failed", e)
        throw createServiceError("Could not connect to the AI service", 502)
    } finally {
        clearTimeout(timeout)
    }
}

module.exports = {
    generateFutureStory,
    generateDailyMotivation
}
