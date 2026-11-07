
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/useAuth"

function Register() {
    const { register } = useAuth()
    const navigate = useNavigate()

    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            setLoading(true)
            setError("")

            await register(username, email, password)

            navigate("/dashboard")
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Registration failed. Please try again."
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black text-white flex">

            {/* Left Side */}
            <div className="hidden md:flex w-1/2 flex-col justify-between p-12 border-r border-white/10">

                <h1 className="text-2xl font-bold tracking-widest">
                    FUTURE YOU<span className="text-gray-500">.</span>
                </h1>

                <div>
                    <p className="text-gray-500 uppercase tracking-[0.3em] text-sm mb-6">
                        Start today
                    </p>

                    <h2 className="text-5xl lg:text-6xl font-bold leading-tight">
                        DON'T WAIT
                        <br />
                        FOR CHANGE.
                        <br />
                        <span className="text-gray-500">CREATE IT.</span>
                    </h2>

                    <p className="text-gray-400 mt-6 max-w-md leading-7">
                        Your goals deserve more than just dreams.
                        Take the first step today and start building
                        the future you imagine.
                    </p>
                </div>

                <p className="text-gray-600 text-sm">
                    © 2026 FUTURE YOU. ALL RIGHTS RESERVED.
                </p>

            </div>

            {/* Right Side */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8">

                <div className="w-full max-w-md">

                    <div className="mb-10">
                        <p className="text-gray-500 text-sm uppercase tracking-[0.3em] mb-3">
                            Create your account
                        </p>

                        <h2 className="text-4xl font-bold">
                            REGISTER
                        </h2>

                        <p className="text-gray-400 mt-3">
                            Start your journey and take control of your future.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div>
                            <label className="block text-sm mb-2 text-gray-300">
                                Username
                            </label>

                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                required
                                className="w-full bg-transparent border border-white/20 rounded-lg px-4 py-4 outline-none focus:border-white transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm mb-2 text-gray-300">
                                Email Address
                            </label>

                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                className="w-full bg-transparent border border-white/20 rounded-lg px-4 py-4 outline-none focus:border-white transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm mb-2 text-gray-300">
                                Password
                            </label>

                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Create a password"
                                required
                                minLength={6}
                                className="w-full bg-transparent border border-white/20 rounded-lg px-4 py-4 outline-none focus:border-white transition"
                            />
                        </div>

                        {error && (
                            <p className="text-red-400 text-sm">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-black font-semibold py-4 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
                        >
                            {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
                        </button>

                    </form>

                    <p className="text-center text-gray-400 mt-8">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="text-white font-semibold hover:underline"
                        >
                            Login
                        </Link>
                    </p>

                </div>

            </div>

        </div>
    )
}

export default Register
