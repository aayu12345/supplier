
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

    // Fetch Document Verification Status
    const { data: documents } = await supabase
        .from("supplier_documents")
        .select("document_type, verification_status, admin_notes, expiry_date")
        .eq("supplier_id", user?.id);

    // Map documents to a lookup object for easy access
    const documentStatus: Record<string, any> = {};
    documents?.forEach(doc => {
        const key = doc.document_type.toLowerCase().replace(/ /g, '_');
        documentStatus[key] = {
            status: doc.verification_status,
            notes: doc.admin_notes,
            expiry_date: doc.expiry_date
        };
    });

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans p-6">
            <div className="max-w-6xl mx-auto mb-8">
                <h1 className="text-2xl font-bold text-gray-900">My Profile & Settings</h1>
                <p className="text-gray-500">Manage your company details and view your trust score.</p>
            </div>

            <ProfileView profile={profile} metrics={metrics} documentStatus={documentStatus} />
        </div>
    );
}
