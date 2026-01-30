import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SettingsForm from "@/components/dashboard/buyer/settings/SettingsForm";

export default async function SettingsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect("/auth/login");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    // Merge user metadata if profile is basically empty
    const initialData = {
        ...profile,
        name: profile?.name || user.user_metadata?.full_name || "",
        phone: profile?.phone || user.user_metadata?.phone || "",
        email: user.email
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12">
            <SettingsForm initialData={initialData} userEmail={user.email || ""} />
        </div>
    );
}
