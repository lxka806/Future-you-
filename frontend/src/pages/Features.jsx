
import FeaturesBG from "../assets/FunctionBG.png"

function Features() {
    const features = [
        {
            number: "01",
            title: "SET YOUR GOALS",
            description: "Turn your ambitions into clear goals and give yourself a direction to follow."
        },
        {
            number: "02",
            title: "TRACK YOUR PROGRESS",
            description: "Monitor your achievements and see how far you've come."
        },
        {
            number: "03",
            title: "BUILD DISCIPLINE",
            description: "Develop better habits and stay consistent with your daily actions."
        },
        {
            number: "04",
            title: "TALK TO YOUR FUTURE SELF",
            description: "Visualize your success and connect with the person you want to become."
        }
    ];

    return (
        <section
            id="features"
            className="relative flex min-h-[100svh] w-full scroll-mt-20 items-center bg-cover bg-center bg-no-repeat px-5 py-20 text-white sm:px-8 sm:py-24 md:px-12 lg:px-20"
            style={{ backgroundImage: `url(${FeaturesBG})` }}
        >
            <div className="absolute inset-0 bg-black/70"></div>

            <div className="relative z-10 max-w-7xl mx-auto w-full">

                <p className="mb-4 text-xs tracking-[0.2em] text-gray-400 sm:mb-5 sm:text-sm sm:tracking-[5px]">
                    03 — WHAT WE OFFER
                </p>

                <h1 className="mb-5 text-3xl font-black leading-tight min-[420px]:text-4xl sm:mb-6 md:text-6xl">
                    UNLOCK YOUR POTENTIAL.
                </h1>

                <p className="mb-9 max-w-2xl text-base text-gray-300 sm:mb-14 sm:text-lg">
                    Everything you need to turn your ambitions into actions,
                    build discipline and create a better future.
                </p>

                <div className="grid max-w-5xl grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">

                    {features.map((feature) => (
                        <div
                            key={feature.number}
                            className="min-h-[170px] rounded-xl border border-white/20 bg-black/60 p-5 backdrop-blur-sm transition duration-300 hover:border-white sm:min-h-[190px] sm:p-8"
                        >
                            <p className="mb-4 text-sm text-gray-500 sm:mb-6">
                                {feature.number}
                            </p>

                            <h2 className="text-xl font-bold mb-3">
                                {feature.title}
                            </h2>

                            <p className="text-gray-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}

                </div>

                <h2 className="mt-12 text-2xl font-black leading-tight sm:mt-16 md:text-4xl">
                    YOUR FUTURE STARTS WITH YOU.
                </h2>

            </div>
        </section>
    );
}

export default Features;
