import { ArrowUpRight, DollarSign, Clock } from "lucide-react";

export type Financials = {
    credit_terms: string;
    credit_limit: number;
    outstanding_balance: number;
    total_paid: number; // Calculated dynamically
};

export default function BillingOverview({ financials }: { financials: Financials }) {
    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Account Overview / Outstanding */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-gray-500 text-sm font-medium mb-1">Outstanding Balance</p>
                        <h3 className="text-3xl font-bold text-gray-900">{formatCurrency(financials.outstanding_balance)}</h3>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                        <ArrowUpRight className="h-6 w-6 text-red-600" />
                    </div>
                </div>
                {financials.outstanding_balance > 0 && (
                    <div className="mt-4 flex items-center gap-2 text-xs font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full w-fit">
                        <Clock className="h-3 w-3" /> Due Soon
                    </div>
                )}
            </div>

            {/* Invoices Paid */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-gray-500 text-sm font-medium mb-1">Invoices Paid</p>
                        <h3 className="text-3xl font-bold text-gray-900">{formatCurrency(financials.total_paid)}</h3>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                        <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                </div>
                <p className="text-sm text-gray-400 mt-4">Lifetime total</p>
            </div>

            {/* Credit Terms */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-gray-500 text-sm font-medium mb-1">Credit Terms</p>
                        <h3 className="text-3xl font-bold text-gray-900">{financials.credit_terms}</h3>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                        <span className="text-blue-600 font-bold text-lg">%</span>
                    </div>
                </div>
                <p className="text-sm text-gray-500 mt-4">Credit Limit: {formatCurrency(financials.credit_limit)}</p>
            </div>
        </div>
    );
}
