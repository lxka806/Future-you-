import Logo from "../assets/Logo.png"

function Footer() {
    return (
        <footer className="border-t border-white/10 bg-black px-5 pb-8 pt-14 text-white sm:px-8 sm:pt-20 md:px-12 lg:px-20">

            <div className="max-w-7xl mx-auto">

                {/* TOP SECTION */}
                <div className="flex flex-col justify-between gap-10 pb-12 sm:gap-12 sm:pb-16 md:flex-row">

                    {/* BRAND */}
                    <div className="max-w-md">
                        <img
                            src={Logo}
                            alt="Future You"
                            className="w-36 mb-6"
                        />

                        <h2 className="mb-5 text-2xl font-black leading-tight min-[420px]:text-3xl md:text-4xl">
                            YOUR FUTURE.
                            <br />
                            YOUR RESPONSIBILITY.
                        </h2>

                        <p className="text-gray-400 leading-relaxed max-w-sm">
                            Stop waiting for the right moment.
                            Build discipline, set your goals and become
                            the person you've always wanted to be.
                        </p>
                    </div>

                    {/* NAVIGATION */}
                    <div className="grid grid-cols-2 gap-6 sm:gap-12 md:gap-16 lg:gap-20">

                        <div>
                            <h3 className="text-sm font-bold tracking-widest mb-6">
                                EXPLORE
                            </h3>

                            <ul className="space-y-4 text-gray-400">
                                <li><a href="#home" className="hover:text-white transition">Home</a></li>
                                <li><a href="#about" className="hover:text-white transition">About Us</a></li>
                                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                                <li><a href="#how-it-works" className="hover:text-white transition">How It Works</a></li>
                                <li><a href="#faq" className="hover:text-white transition">FAQ</a></li>
                                <li><a href="#reviews" className="hover:text-white transition">Reviews</a></li>
                            </ul>
                        </div>

                        <div>
                        <h3 className="text-sm font-bold tracking-widest mb-6">
                            FOLLOW US
                        </h3>

                        <ul className="space-y-4 text-gray-400">
                            <li>
                                <a
                                    href="https://www.instagram.com/YOUR_USERNAME"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-white transition"
                                >
                                    Instagram
                                </a>
                            </li>

                            <li>
                                <a
                                    href="https://www.tiktok.com/@YOUR_USERNAME"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-white transition"
                                >
                                    TikTok
                                </a>
                            </li>
                        </ul>
                    </div>

                    </div>
                </div>

                {/* BIG TEXT */}
                <div className="border-y border-white/10 py-8 sm:py-10">
                    <h1 className="text-center text-4xl font-black tracking-tighter text-white/10 min-[420px]:text-5xl sm:text-6xl md:text-8xl">
                        FUTURE YOU.
                    </h1>
                </div>

                {/* BOTTOM SECTION */}
                <div className="flex flex-col items-center justify-between gap-4 pt-7 text-center text-xs text-gray-500 sm:text-sm md:flex-row md:text-left">

                    <p>
                        © {new Date().getFullYear()} Future You. All rights reserved.
                    </p>

                    <p className="text-center tracking-widest uppercase md:text-right">
                        Become who you were meant to be.
                    </p>

                </div>

            </div>
        </footer>
    )
}

export default Footer