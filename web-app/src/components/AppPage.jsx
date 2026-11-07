import Sidebar from "./Sidebar"

function AppPage({ children, className = "" }) {
    return (
        <>
            <Sidebar />
            <main className={`min-h-screen pt-16 md:ml-64 md:pt-0 ${className}`}>
                {children}
            </main>
        </>
    )
}

export default AppPage
