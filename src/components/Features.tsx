import { Globe, ShieldCheck, Zap } from "lucide-react";

const features = [
    {
        title: "Wide Supplier Network",
        description:
            "Access verified suppliers across India specializing in precision manufacturing, CNC machining, sheet metal, and more.",
        icon: Globe,
        color: "bg-blue-50 text-blue-600",
    },
    {
        title: "Verified & Trusted",
        description:
            "All suppliers are verified with trust scores based on delivery performance, quality, and buyer ratings.",
        icon: ShieldCheck,
        color: "bg-green-50 text-green-600",
    },
    {
        title: "End-to-End Management",
        description:
            "From RFQ upload to final payment — manage quotes, orders, production tracking, and payments in one place.",
        icon: Zap,
        color: "bg-blue-50 text-blue-400",
    },
];

export default function Features() {
    return (
        <section id="features" className="py-24 bg-gray-50/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Why TheSupplier.in?
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
                        >
                            <div
                                className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-6`}
                            >
                                <feature.icon className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
