import { useState } from "react"
import Logo from "../assets/Logo.png"
import Button from "./button.jsx"

function NavBar() {
    const [menuOpen, setMenuOpen] = useState(false)
    const closeMenu = () => setMenuOpen(false)

    return (
        <header className="fixed inset-x-0 top-0 z-50 bg-black text-white">
            <div className="mx-auto flex min-h-16 max-w-[1600px] items-center justify-between gap-4 px-4 py-2 sm:px-6 lg:px-10">
                <a href="#home" aria-label="Go to Home" onClick={closeMenu} className="shrink-0">
                    <img src={Logo} alt="Future You" className="w-24 sm:w-28 lg:w-32" />
                </a>

                <nav
                    id="main-navigation"
                    aria-label="Main navigation"
                    className={`${menuOpen ? "flex" : "hidden"} absolute inset-x-0 top-full max-h-[calc(100svh-4rem)] flex-col gap-1 overflow-y-auto border-t border-white/10 bg-black px-4 py-4 shadow-xl sm:px-6 lg:static lg:flex lg:max-h-none lg:flex-row lg:items-center lg:justify-center lg:gap-4 lg:overflow-visible lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none xl:gap-6`}
                >
                    {[
                        ["Home", "#home"],
                        ["About", "#about"],
                        ["Features", "#features"],
                        ["How It Works", "#how-it-works"],
                        ["FAQ", "#faq"],
                        ["Reviews", "#reviews"]
                    ].map(([label, href]) => (
                        <a
                            key={href}
                            href={href}
                            onClick={closeMenu}
                            className="rounded px-3 py-2 text-sm transition hover:bg-white/10 hover:text-gray-300 lg:px-0 lg:py-1 lg:text-xs xl:text-sm"
                        >
                            {label}
                        </a>
                    ))}
                    <a
                        href="https://future-you-web-app.netlify.app/login"
                        onClick={closeMenu}
                        className="mt-2 rounded-full bg-white px-5 py-3 text-center text-sm font-semibold text-black transition hover:bg-gray-300 lg:hidden"
                    >
                        Start Your Journey
                    </a>
                </nav>

                <div className="hidden shrink-0 lg:block">
                    <Button buttonText="Start Your Journey" href="https://future-you-web-app.netlify.app/login" />
                </div>

                <button
                    type="button"
                    onClick={() => setMenuOpen(open => !open)}
                    aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                    aria-expanded={menuOpen}
                    aria-controls="main-navigation"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/20 text-xl transition hover:bg-white/10 lg:hidden"
                >
                    {menuOpen ? "×" : "☰"}
                </button>
            </div>
        </header>
    );
}

export default NavBar;