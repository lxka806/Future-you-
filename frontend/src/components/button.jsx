
function Button({ buttonText, href }) {
    return (
        <a href={href} className="bg-white text-black px-6 py-2 rounded-full font-semibold hover:bg-gray-300 transition whitespace-nowrap">
            {buttonText}
        </a>
    );
}

export default Button;
