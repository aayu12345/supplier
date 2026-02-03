
import { createClient } from "@/lib/supabase/server";
import ProfileView from "./profile-view";

export default async function SupplierProfilePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch Profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

    // Fetch Metrics
    const { data: metrics } = await supabase
        .from("supplier_metrics")
        .select("trust_score, performance_ratings")
        .eq("id", user?.id)
        .single();

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans p-6">
            <div className="max-w-6xl mx-auto mb-8">
                <h1 className="text-2xl font-bold text-gray-900">My Profile & Settings</h1>
                <p className="text-gray-500">Manage your company details and view your trust score.</p>
            </div>

            <ProfileView profile={profile} metrics={metrics} />
        </div>
    );
}
