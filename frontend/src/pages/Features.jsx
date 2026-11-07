
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
            className="min-h-screen w-full relative bg-cover bg-center bg-no-repeat text-white flex items-center px-8 md:px-20 py-24 scroll-mt-24"
            style={{ backgroundImage: `url(${FeaturesBG})` }}
        >
            <div className="absolute inset-0 bg-black/70"></div>

            <div className="relative z-10 max-w-7xl mx-auto w-full">

                <p className="text-gray-400 tracking-[5px] text-sm mb-5">
                    03 — WHAT WE OFFER
                </p>

                <h1 className="text-4xl md:text-6xl font-black mb-6">
                    UNLOCK YOUR POTENTIAL.
                </h1>

                <p className="text-gray-300 text-lg max-w-2xl mb-14">
                    Everything you need to turn your ambitions into actions,
                    build discipline and create a better future.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">

                    {features.map((feature) => (
                        <div
                            key={feature.number}
                            className="bg-black/60 backdrop-blur-sm border border-white/20 rounded-xl p-8 hover:border-white transition duration-300 min-h-[190px]"
                        >
                            <p className="text-gray-500 text-sm mb-6">
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

                <h2 className="text-2xl md:text-4xl font-black mt-16">
                    YOUR FUTURE STARTS WITH YOU.
                </h2>

            </div>
        </section>
    );
}

export default Features;
