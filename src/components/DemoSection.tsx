import { Shield, User, Factory, ArrowRight } from "lucide-react";
import Link from "next/link";

const roles = [
    {
        title: "Admin",
        description:
            "Platform operator view. Manage RFQs, orders, payments, and users.",
        icon: Shield,
        color: "bg-blue-100 text-blue-600",
        buttonColor: "bg-blue-600 hover:bg-blue-700 text-white",
        slug: "admin",
    },
    {
        title: "Buyer",
        description:
            "Upload RFQs, receive quotes, approve suppliers, and track orders.",
        icon: User,
        color: "bg-cyan-100 text-cyan-600",
        buttonColor: "bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200",
        slug: "buyer",
    },
    {
        title: "Supplier",
        description:
            "Browse RFQs, submit quotes, manage orders, and track payments.",
        icon: Factory,
        color: "bg-green-100 text-green-600",
        buttonColor: "bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200",
        slug: "supplier",
    },
];

export default function DemoSection() {
    return (
        <section id="demo" className="py-24 bg-gray-50/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
                        Try the Demo
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Experience the platform from different perspectives. Select a role to
                        explore the dashboard.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {roles.map((role, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col items-center text-center"
                        >
                            <div
                                className={`w-16 h-16 rounded-full ${role.color} flex items-center justify-center mb-6`}
                            >
                                <role.icon className="h-8 w-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                {role.title}
                            </h3>
                            <p className="text-gray-600 mb-8 flex-grow">{role.description}</p>
                            {role.slug === "buyer" ? (
                                <Link
                                    href="/start/buyer"
                                    className="inline-flex items-center justify-center w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                                >
                                    Enter as Buyer
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            ) : (
                                <Link
                                    href={`/dashboard/${role.slug}`}
                                    className={`w-full inline-flex items-center justify-center px-6 py-3 text-base font-semibold rounded-lg transition-colors ${role.buttonColor}`}
                                >
                                    Enter as {role.title}
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
