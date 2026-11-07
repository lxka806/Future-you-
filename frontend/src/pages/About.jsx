
import AboutBG from "../assets/AboutBG.png"

function About() {
    return (
        <section
            id="about"
            className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex items-center justify-end px-20 scroll-mt-24"
            style={{ backgroundImage: `url(${AboutBG})` }}
        >
            <div className="max-w-2xl">
                <p className="text-gray-400 tracking-[5px] text-sm mb-5">
                    ABOUT US — FUTURE YOU
                </p>

                <h1 className="text-white text-5xl font-black leading-tight mb-6">
                    BECOME THE PERSON
                    <br />
                    YOU WERE MEANT
                    <br />
                    TO BE.
                </h1>

                <p className="text-gray-300 text-lg leading-relaxed mb-4">
                    Everyone has a vision of who they want to become.
                    Stronger, more disciplined, more focused.
                    But a vision without action remains just a dream.
                </p>

                <p className="text-gray-300 text-lg leading-relaxed mb-4">
                    Future You was created to turn that vision into reality.
                    Set meaningful goals, build better habits, track your
                    progress and stay committed to your personal growth.
                </p>

                <p className="text-gray-300 text-lg leading-relaxed">
                    Greatness isn't built in a single moment.
                    It's built through consistency, discipline and the
                    small decisions you make every day.
                </p>
            </div>
        </section>
    );
}

export default About;
