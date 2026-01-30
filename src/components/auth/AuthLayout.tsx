import { Check } from "lucide-react";

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
    testimonials?: string[]; // Optional for future use
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        <div className="min-h-screen flex bg-white">
            {/* Left Side - Hero/Branding */}
            <div className="hidden lg:flex w-1/2 bg-[#0F172A] text-white p-12 flex-col justify-center relative overflow-hidden">
                {/* Abstract shapes or texture could go here */}

                <div className="relative z-10 max-w-lg">
                    <h1 className="text-4xl font-bold mb-2 tracking-wide uppercase text-gray-200">
                        The Supplier
                    </h1>
                    <h2 className="text-5xl font-bold mb-12 leading-tight">
                        Partner in <br />
                        Manufacturing
                    </h2>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="mt-1 bg-white/10 p-1 rounded-full">
                                <Check className="h-5 w-5 text-white" />
                            </div>
                            <p className="text-xl text-gray-300">
                                Faster RFQ & <br /> Quotation Workflow
                            </p>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="mt-1 bg-white/10 p-1 rounded-full">
                                <Check className="h-5 w-5 text-white" />
                            </div>
                            <p className="text-xl text-gray-300">
                                Verified Partners. <br /> Transparent Communication
                            </p>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="mt-1 bg-white/10 p-1 rounded-full">
                                <Check className="h-5 w-5 text-white" />
                            </div>
                            <p className="text-xl text-gray-300">
                                Simplify Manufacturing <br /> Expand Globally
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md space-y-8">
                    {/* Mobile Logo only visible on small screens */}
                    <div className="lg:hidden mb-8 text-center">
                        <h1 className="text-2xl font-bold text-gray-900">TheSupplier.in</h1>
                    </div>

                    <div className="mb-10">
                        <h2 className="text-4xl font-bold text-gray-900 mb-2">{title}</h2>
                        {subtitle && <p className="text-gray-600">{subtitle}</p>}
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}
