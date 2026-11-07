
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
            className="min-h-[100svh] scroll-mt-20 bg-black px-5 py-20 text-white sm:px-8 sm:py-24 md:px-12 lg:px-20"
        >
            <div className="max-w-7xl mx-auto">

                <div className="mb-12 text-center sm:mb-20">
                    <p className="mb-4 text-xs tracking-[0.2em] text-gray-500 sm:mb-5 sm:text-sm sm:tracking-[5px]">
                        04 — YOUR JOURNEY
                    </p>

                    <h1 className="mb-5 text-3xl font-black sm:mb-6 min-[420px]:text-4xl md:text-6xl">
                        HOW IT WORKS.
                    </h1>

                    <p className="mx-auto max-w-2xl text-base text-gray-400 sm:text-lg">
                        Becoming your future self starts with a single
                        decision. Follow these four steps and start
                        building the future you want.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                    {steps.map((step) => (
                        <div
                            key={step.number}
                            className="rounded-xl border border-[#252525] bg-[#0D0D0D] p-5 transition duration-300 hover:border-white sm:p-8"
                        >
                            <p className="mb-5 text-4xl font-black text-gray-600 sm:mb-8 sm:text-5xl">
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

                <div className="mt-14 text-center sm:mt-20">
                    <h2 className="text-2xl font-black leading-tight sm:text-3xl md:text-5xl">
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