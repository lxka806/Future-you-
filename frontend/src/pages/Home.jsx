
import HomeBG from "../assets/HomeBG.png"

function Home() {
    return (
        <>
            <section
                id="home"
                className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex items-center scroll-mt-24"
                style={{ backgroundImage: `url(${HomeBG})` }}
            >
                <div className="pl-20 max-w-3xl">
                    <p className="text-white tracking-[5px] text-sm mb-6">
                        THE ONLY COMPETITION IS YOU.
                    </p>

                    <h1 className="text-white text-7xl font-black leading-tight">
                        YOUR FUTURE
                        <br />
                        IS BUILT BY
                        <br />
                        WHAT YOU DO
                        <br />
                        TODAY.
                    </h1>

                    <p className="text-gray-300 text-lg mt-6 max-w-xl leading-relaxed">
                        Every decision matters. Every action counts.
                        Stop waiting for the perfect moment.
                        Become the person you promised yourself you'd be.
                    </p>

                    <a href="#how-it-works" className="mt-8 inline-block bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-gray-300 transition">
                        BECOME YOUR FUTURE SELF
                    </a>
                </div>
            </section>
        </>
    );
}

export default Home;
