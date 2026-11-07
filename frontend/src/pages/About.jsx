
import AboutBG from "../assets/AboutBG.png"

function About() {
    return (
        <section
            id="about"
            className="flex min-h-[100svh] w-full scroll-mt-20 items-center justify-end bg-cover bg-center bg-no-repeat px-5 py-24 sm:px-8 md:px-12 lg:px-20"
            style={{ backgroundImage: `url(${AboutBG})` }}
        >
            <div className="w-full max-w-2xl">
                <p className="mb-4 text-xs tracking-[0.2em] text-gray-400 sm:mb-5 sm:text-sm sm:tracking-[5px]">
                    ABOUT US — FUTURE YOU
                </p>

                <h1 className="mb-5 text-3xl font-black leading-tight text-white min-[420px]:text-4xl sm:mb-6 sm:text-5xl">
                    BECOME THE PERSON
                    <br />
                    YOU WERE MEANT
                    <br />
                    TO BE.
                </h1>

                <p className="mb-4 text-base leading-relaxed text-gray-300 sm:text-lg">
                    Everyone has a vision of who they want to become.
                    Stronger, more disciplined, more focused.
                    But a vision without action remains just a dream.
                </p>

                <p className="mb-4 text-base leading-relaxed text-gray-300 sm:text-lg">
                    Future You was created to turn that vision into reality.
                    Set meaningful goals, build better habits, track your
                    progress and stay committed to your personal growth.
                </p>

                <p className="text-base leading-relaxed text-gray-300 sm:text-lg">
                    Greatness isn't built in a single moment.
                    It's built through consistency, discipline and the
                    small decisions you make every day.
                </p>
            </div>
        </section>
    );
}

export default About;
