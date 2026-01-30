export default function HowItWorks() {
    const steps = [
        {
            id: 1,
            title: "Upload RFQ",
            description:
                "Buyers upload drawings, specify quantity, material, and timeline.",
            color: "bg-blue-600",
        },
        {
            id: 2,
            title: "Receive Quotes",
            description: "Verified suppliers submit competitive quotes within days.",
            color: "bg-blue-600",
        },
        {
            id: 3,
            title: "Approve & Order",
            description:
                "Compare quotes, negotiate if needed, and approve the best offer.",
            color: "bg-blue-600",
        },
        {
            id: 4,
            title: "Track Production",
            description: "Monitor production milestones and receive regular updates.",
            color: "bg-blue-600",
        },
        {
            id: 5,
            title: "Complete Payment",
            description:
                "Secure payment processing with advance and balance tracking.",
            color: "bg-blue-600",
        },
    ];

    return (
        <section id="how-it-works" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl text-center">
                        How It Works
                    </h2>
                </div>

                <div className="relative max-w-3xl mx-auto">
                    {/* Vertical line connecting steps */}
                    <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gray-200 hidden sm:block"></div>

                    <div className="space-y-12">
                        {steps.map((step) => (
                            <div key={step.id} className="relative flex items-start group">
                                {/* Step Number Circle */}
                                <div
                                    className={`flex-shrink-0 w-12 h-12 rounded-full ${step.color} flex items-center justify-center text-white font-bold text-lg shadow-lg z-10`}
                                >
                                    {step.id}
                                </div>

                                {/* Content */}
                                <div className="ml-8 pt-2">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        {step.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
