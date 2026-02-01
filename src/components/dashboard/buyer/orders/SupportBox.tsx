import { Headset, Mail } from "lucide-react";

export default function SupportBox({ rfqNumber }: { rfqNumber: string }) {
    return (
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white h-auto">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                    <Headset className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-bold mb-1">Need Help?</h3>
                    <p className="text-blue-100 text-sm mb-6">
                        Have questions about this order? Our team is directly connected to the supplier.
                    </p>

                    <a
                        href={`mailto:support@thesupplier.in?subject=Help needed for Order ${rfqNumber}`}
                        className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 px-4 py-2.5 rounded-lg font-bold text-sm transition-colors w-full justify-center shadow-sm"
                    >
                        <Mail className="h-4 w-4" />
                        Email Support
                    </a>
                </div>
            </div>
        </div>
    );
}
