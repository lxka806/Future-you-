import Logo from "../assets/Logo.png"
import Button from "./button.jsx"

function NavBar() {
    return ( 
        <header className="bg-[#000] fixed top-0 left-0 right-0 z-50 text-white flex flex-wrap items-center justify-between gap-2 px-2 py-2 sm:px-4">
            <a href="#home" aria-label="Go to Home">
                <img src={Logo} alt="Home" className="w-30" />
            </a>
            <nav aria-label="Main navigation" className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm sm:text-base">
                <a href="#home" className="hover:text-gray-300">Home</a>
                <a href="#about" className="hover:text-gray-300">About</a>
                <a href="#features" className="hover:text-gray-300">Features</a>
                <a href="#how-it-works" className="hover:text-gray-300">How It Works</a>
                <a href="#faq" className="hover:text-gray-300">FAQ</a>
                <a href="#reviews" className="hover:text-gray-300">Reviews</a>
            </nav>
            <Button buttonText="Start Your Journey" href="https://future-you-web-app.netlify.app/login" />
        </header>
    );
}

export default NavBar;