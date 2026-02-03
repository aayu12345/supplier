import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const docType = formData.get('docType') as string;

        if (!file || !docType) {
            return NextResponse.json({ error: "Missing file or document type" }, { status: 400 });
        }

        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${docType}_${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('supplier-documents')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            return NextResponse.json({ error: "Upload failed" }, { status: 500 });
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('supplier-documents')
            .getPublicUrl(fileName);

        // Update profile with document metadata
        const { data: profile } = await supabase
            .from('profiles')
            .select('documents')
            .eq('id', user.id)
            .single();

        const documents = profile?.documents || {};
        documents[docType] = {
            url: publicUrl,
            status: 'Pending',
            uploaded_at: new Date().toISOString()
        };

        const { error: updateError } = await supabase
            .from('profiles')
            .update({ documents })
            .eq('id', user.id);

        if (updateError) {
            console.error('Update error:', updateError);
            return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
        }

        return NextResponse.json({ success: true, url: publicUrl });
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
