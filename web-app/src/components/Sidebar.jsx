import { useState } from "react"
import { NavLink } from "react-router-dom"
import { useAuth } from "../context/useAuth"
import { 
    LayoutDashboard, 
    Target, 
    TrendingUp, 
    Sparkles, 
    PenLine, 
    BookOpen, 
    User, 
    Settings 
} from "lucide-react"

const mainMenuLinks = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "My Goals", path: "/my-goals", icon: Target },
    { name: "Goal Progress", path: "/progress", icon: TrendingUp }
]

const futureLinks = [
    { name: "Daily Motivation", path: "/motivation", icon: Sparkles },
    { name: "Future Stories", path: "/stories", icon: PenLine },
    { name: "Journal", path: "/journal", icon: BookOpen }
]

const accountLinks = [
    { name: "My Profile", path: "/profile", icon: User },
    { name: "Settings", path: "/settings", icon: Settings }
]

function Sidebar() {
    const { user } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const initials = user?.username?.charAt(0)?.toUpperCase() || "U"

    return (
        <>
            {/* MOBILE HEADER */}
            <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-[#222222] bg-[#080808] px-4 md:hidden">
                <button
                    type="button"
                    onClick={() => setIsOpen(open => !open)}
                    aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
                    aria-expanded={isOpen}
                    aria-controls="app-sidebar"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#303030] text-xl text-white transition hover:bg-[#171717]"
                >
                    {isOpen ? "×" : "☰"}
                </button>
                <span className="text-lg font-black tracking-wider text-white">
                    FUTURE <span className="text-[#A3A3A3]">YOU.</span>
                </span>
                {/* Mobile Profile Image */}
                {user?.profilePicture ? (
                    <img 
                        src={user.profilePicture} 
                        alt="Profile" 
                        className="h-9 w-9 rounded-full border border-[#303030] object-cover" 
                    />
                ) : (
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#303030] text-sm font-medium text-white">
                        {initials}
                    </span>
                )}
            </header>

            {/* MOBILE OVERLAY */}
            {isOpen && (
                <button
                    type="button"
                    aria-label="Close navigation menu"
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 z-40 bg-black/70 md:hidden"
                />
            )}

            {/* SIDEBAR */}
            <aside
                id="app-sidebar"
                aria-label="Main navigation"
                className={`fixed inset-y-0 left-0 z-[60] flex h-dvh w-72 max-w-[85vw] flex-col border-r border-[#222222] bg-[#080808] transition-transform duration-200 md:z-50 md:w-64 md:max-w-none md:translate-x-0 ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {/* Logo / Brand Area */}
                <div className="flex shrink-0 items-center justify-between px-6 py-8">
                    <h1 className="text-white text-2xl font-black tracking-wider">
                        FUTURE <span className="text-[#A3A3A3]">YOU.</span>
                    </h1>
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        aria-label="Close navigation menu"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-[#A3A3A3] hover:bg-[#171717] hover:text-white md:hidden"
                    >
                        ×
                    </button>
                </div>

                {/* Navigation Area with Custom Scrollbar */}
                <div className="flex-1 overflow-y-auto px-4 pb-6 flex flex-col gap-8 custom-scrollbar">
                    
                    {/* Main Menu Section */}
                    <div>
                        <p className="text-[#A3A3A3] text-[11px] tracking-[3px] uppercase mb-3 px-3 font-semibold">
                            Main Menu
                        </p>
                        <nav className="flex flex-col gap-1">
                            {mainMenuLinks.map((link) => (
                                <SidebarLink key={link.path} link={link} onNavigate={() => setIsOpen(false)} />
                            ))}
                        </nav>
                    </div>

                    {/* Your Future Section */}
                    <div>
                        <p className="text-[#A3A3A3] text-[11px] tracking-[3px] uppercase mb-3 px-3 font-semibold">
                            Your Future
                        </p>
                        <nav className="flex flex-col gap-1">
                            {futureLinks.map((link) => (
                                <SidebarLink key={link.path} link={link} onNavigate={() => setIsOpen(false)} />
                            ))}
                        </nav>
                    </div>

                    {/* Account Section */}
                    <div>
                        <nav className="flex flex-col gap-1">
                            {accountLinks.map((link) => (
                                <SidebarLink key={link.path} link={link} onNavigate={() => setIsOpen(false)} />
                            ))}
                        </nav>
                    </div>

                </div>

                {/* User Profile Footer */}
                <div className="p-4 border-t border-[#222222] shrink-0">
                    <NavLink
                        to="/profile"
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                                isActive
                                    ? "bg-[#222222] text-white"
                                    : "text-[#A3A3A3] hover:bg-[#171717] hover:text-white"
                            }`
                        }
                    >
                        {/* Desktop Profile Image */}
                        {user?.profilePicture ? (
                            <img
                                src={user.profilePicture}
                                alt="Profile"
                                className="w-8 h-8 rounded-full border border-[#303030] object-cover shrink-0"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-[#303030] flex items-center justify-center shrink-0">
                                <span className="text-white text-sm font-medium">{initials}</span>
                            </div>
                        )}
                        
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium leading-tight truncate">
                                {user?.username || "Your Profile"}
                            </span>
                            <span className="text-[11px] text-[#A3A3A3]">Account settings</span>
                        </div>
                    </NavLink>
                </div>
            </aside>
        </>
    )
}

// Extracted link component
function SidebarLink({ link, onNavigate }) {
    const Icon = link.icon
    
    return (
        <NavLink
            to={link.path}
            end
            onClick={onNavigate}
            className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                    isActive
                        ? "bg-white text-black font-semibold"
                        : "text-[#A3A3A3] hover:bg-[#171717] hover:text-white"
                }`
            }
        >
            <Icon size={18} strokeWidth={2} />
            <span className="text-sm">{link.name}</span>
        </NavLink>
    )
}

export default Sidebar