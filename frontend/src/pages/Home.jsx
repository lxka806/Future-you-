
import HomeBG from "../assets/HomeBG.png"

function Home() {
    return (
        <>
            <section
                id="home"
                className="flex min-h-[100svh] w-full scroll-mt-20 items-center bg-cover bg-center bg-no-repeat px-5 pb-12 pt-24 sm:px-8 md:px-12 lg:px-20"
                style={{ backgroundImage: `url(${HomeBG})` }}
            >
                <div className="w-full max-w-3xl">
                    <p className="mb-4 text-xs tracking-[0.2em] text-white sm:mb-6 sm:text-sm sm:tracking-[5px]">
                        THE ONLY COMPETITION IS YOU.
                    </p>

                    <h1 className="text-4xl font-black leading-[1.08] text-white min-[420px]:text-5xl sm:text-6xl md:text-7xl">
                        YOUR FUTURE
                        <br />
                        IS BUILT BY
                        <br />
                        WHAT YOU DO
                        <br />
                        TODAY.
                    </h1>

                    <p className="mt-5 max-w-xl text-base leading-relaxed text-gray-300 sm:mt-6 sm:text-lg">
                        Every decision matters. Every action counts.
                        Stop waiting for the perfect moment.
                        Become the person you promised yourself you'd be.
                    </p>

                    <a href="#how-it-works" className="mt-7 inline-block rounded-full bg-white px-6 py-3 text-center text-sm font-bold text-black transition hover:bg-gray-300 sm:px-8 sm:py-4 sm:text-base">
                        BECOME YOUR FUTURE SELF
                    </a>
                </div>
            </section>
        </>
    );
}

export default Home;
