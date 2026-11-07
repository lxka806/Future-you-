import { useState } from "react"
import FAQBG from "../assets/FAQBG.png"

function FAQ() {
    const [activeQuestion, setActiveQuestion] = useState(0)

    const questions = [
        {
            question: "WHAT IS FUTURE YOU?",
            answer: "Future You is a personal development platform designed to help you set goals, build discipline, track your progress and become a better version of yourself."
        },
        {
            question: "HOW DOES IT WORK?",
            answer: "Simply create an account, choose your goals and start working towards them. Future You helps you stay focused and monitor your personal growth."
        },
        {
            question: "IS FUTURE YOU FREE?",
            answer: "You can create an account and explore the platform. Any additional features or pricing details will be displayed on the platform."
        },
        {
            question: "CAN I TRACK MY PROGRESS?",
            answer: "Yes. You can follow your goals and monitor your progress to see how far you've come."
        },
        {
            question: "WHO IS FUTURE YOU FOR?",
            answer: "Future You is for anyone who wants to become more organized, disciplined and intentional about their personal goals."
        },
        {
            question: "HOW DO I GET STARTED?",
            answer: "Click the Start Your Journey button, create your account and begin defining the person you want to become."
        }
    ]

    return (
        <section
            id="faq"
            className="min-h-screen box-border bg-black bg-cover bg-center bg-no-repeat text-white px-6 sm:px-10 lg:px-20 py-24 md:py-28 scroll-mt-24 flex items-center"
            style={{ backgroundImage: `url(${FAQBG})` }}
        >
            <div className="w-full max-w-7xl mx-auto grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
                <div>
                    <p className="text-gray-500 tracking-[5px] text-sm mb-5">
                        05 — QUESTIONS & ANSWERS
                    </p>

                    <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
                        GOT
                        <br />
                        QUESTIONS?
                    </h1>

                    <p className="text-gray-400 text-lg max-w-md leading-relaxed">
                        Everything you need to know about Future You.
                        Find answers to common questions and learn how
                        to start building your future.
                    </p>
                </div>

                <div>
                    <div className="space-y-1">
                        {questions.map((item, index) => (
                            <div key={index} className="border-b border-white/20 py-3">
                            <button
                                onClick={() =>
                                    setActiveQuestion(
                                        activeQuestion === index ? -1 : index
                                    )
                                }
                                className="w-full flex items-center justify-between text-left gap-4"
                                aria-expanded={activeQuestion === index}
                            >
                                <span className="text-base sm:text-lg font-bold">
                                    {item.question}
                                </span>

                                <span aria-hidden="true" className="text-2xl font-light">
                                    {activeQuestion === index ? "−" : "+"}
                                </span>
                            </button>

                            {activeQuestion === index && (
                                <p className="text-gray-400 leading-relaxed mt-3 pr-8">
                                    {item.answer}
                                </p>
                            )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 border-l-2 border-white pl-6">
                        <p className="text-gray-500 text-sm tracking-widest mb-3">
                            STILL HAVE QUESTIONS?
                        </p>

                        <h2 className="text-2xl font-bold">
                            WE'RE HERE TO HELP.
                        </h2>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default FAQ