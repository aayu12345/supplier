"use client";

import AuthLayout from "@/components/auth/AuthLayout";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { loginAdmin } from "../actions";
import { ShieldCheck } from "lucide-react";

const loginSchema = z.object({
    email: z.string().min(1, "Email is required").email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
    const [serverError, setServerError] = useState<string | null>(null);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setServerError(null);
        const formData = new FormData();
        formData.append("email", data.email);
        formData.append("password", data.password);

        const result = await loginAdmin(formData);
        if (result?.error) {
            setServerError(result.error);
        } else {
            setIsRedirecting(true);
        }
    };

    return (
        <AuthLayout title="Admin Login" subtitle="Secure access for platform administrators">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {serverError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                        {serverError}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                        {...register("email")}
                        type="email"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="admin@thesupplier.in"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                        {...register("password")}
                        type="password"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="••••••••"
                    />
                    {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
                </div>

                <div className="hidden">
                    {/* Hidden input to maintain functional parity if needed, but admin doesn't usually have "Remember Me" implemented visually yet */}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting || isRedirecting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
                >
                    {isSubmitting || isRedirecting ? "Authenticating & Redirecting..." : "Access Dashboard"}
                </button>
            </form>

            <div className="mt-8 text-center bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-center gap-2 text-blue-800 mb-1">
                    <ShieldCheck className="h-5 w-5" />
                    <span className="font-semibold text-sm">Secure Portal</span>
                </div>
                <p className="text-xs text-blue-600/80">
                    Restricted area. All activities are monitored.
                </p>
            </div>
        </AuthLayout>
    );
}
