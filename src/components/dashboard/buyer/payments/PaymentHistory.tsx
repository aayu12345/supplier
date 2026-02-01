import { FileText, ArrowDownLeft, Upload } from "lucide-react";

export type Payment = {
    id: string;
    amount: number;
    payment_date: string;
    payment_method: string;
    invoice_number?: string;
};

export default function PaymentHistory({ payments }: { payments: Payment[] }) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Payment History</h3>

            <div className="relative pl-4 space-y-8 before:absolute before:inset-0 before:ml-2 before:-translate-x-px before:h-full before:w-0.5 before:bg-gray-100">
                {payments.map((payment) => (
                    <div key={payment.id} className="relative pl-6">
                        <span className="absolute left-0 top-1.5 -ml-[5px] h-3 w-3 rounded-full bg-green-500 border-2 border-white ring-4 ring-white"></span>
                        <div className="flex justify-between items-start mb-1">
                            <h4 className="text-sm font-bold text-gray-900">{formatCurrency(payment.amount)}</h4>
                            <span className="text-xs text-gray-500">{new Date(payment.payment_date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-gray-600">{payment.payment_method}</p>
                        {payment.invoice_number && (
                            <p className="text-xs text-gray-400 mt-1">Ref: {payment.invoice_number}</p>
                        )}

                        <button className="flex items-center gap-1 text-green-600 hover:text-green-700 text-xs font-medium mt-2">
                            <FileText className="h-3 w-3" /> Advice PDF
                        </button>
                    </div>
                ))}

                {payments.length === 0 && (
                    <div className="pl-6 text-gray-400 text-sm italic">No payment history.</div>
                )}
            </div>

            {/* Quick Upload Action */}
            <div className="mt-8 pt-6 border-t border-gray-100">
                <button className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
                    <Upload className="h-4 w-4" />
                    Upload Payment Advice
                </button>
            </div>
        </div>
    );
}
