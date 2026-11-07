
function HowWorks() {
    const steps = [
        {
            number: "01",
            title: "CREATE YOUR ACCOUNT",
            description: "Join Future You and take the first step towards becoming the person you want to be."
        },
        {
            number: "02",
            title: "DEFINE YOUR GOALS",
            description: "Choose your ambitions and decide what you want to accomplish."
        },
        {
            number: "03",
            title: "TAKE ACTION",
            description: "Build better habits, stay disciplined and work towards your goals every day."
        },
        {
            number: "04",
            title: "TRACK YOUR GROWTH",
            description: "Monitor your progress, celebrate achievements and keep improving."
        }
    ];

    return (
        <section
            id="how-it-works"
            className="min-h-screen bg-black text-white px-8 md:px-20 py-32 scroll-mt-24"
        >
            <div className="max-w-7xl mx-auto">

                <div className="text-center mb-20">
                    <p className="text-gray-500 tracking-[5px] text-sm mb-5">
                        04 — YOUR JOURNEY
                    </p>

                    <h1 className="text-4xl md:text-6xl font-black mb-6">
                        HOW IT WORKS.
                    </h1>

                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Becoming your future self starts with a single
                        decision. Follow these four steps and start
                        building the future you want.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {steps.map((step) => (
                        <div
                            key={step.number}
                            className="bg-[#0D0D0D] border border-[#252525] rounded-xl p-8 hover:border-white transition duration-300"
                        >
                            <p className="text-gray-600 text-5xl font-black mb-8">
                                {step.number}
                            </p>

                            <h2 className="text-xl font-bold mb-4">
                                {step.title}
                            </h2>

                            <p className="text-gray-400 leading-relaxed">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-20">
                    <h2 className="text-3xl md:text-5xl font-black">
                        THE JOURNEY STARTS WITH YOU.
                    </h2>

                    <p className="text-gray-400 mt-5">
                        Don't wait for tomorrow. Start today.
                    </p>
                </div>

            </div>
        </section>
    );
}

export default HowWorks;