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
        const expiryDate = formData.get('expiryDate') as string; // New field

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
            console.error('Upload error details:', {
                message: uploadError.message,
                statusCode: uploadError.statusCode,
                error: uploadError,
                fileName: fileName,
                bucket: 'supplier-documents'
            });
            return NextResponse.json({
                error: "Upload failed",
                details: uploadError.message
            }, { status: 500 });
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('supplier-documents')
            .getPublicUrl(fileName);

        // Map docType to document_type for supplier_documents table
        const documentTypeMap: Record<string, string> = {
            iso_certificate: "ISO Certificate",
            msme_certificate: "MSME Certificate",
            capabilities: "Company Capacities",
            gst_certificate: "GST Certificate",
            company_registration: "Company Registration",
        };

        const document_type = documentTypeMap[docType] || "Other";

        // DEBUG: Log the user ID and document details
        console.log('=== UPLOAD DEBUG ===');
        console.log('User ID:', user.id);
        console.log('Document Type:', document_type);
        console.log('File Name:', file.name);
        console.log('Expiry Date:', expiryDate);

        // Save to supplier_documents table (so admin can see it)
        const { data: insertedData, error: dbError } = await supabase
            .from('supplier_documents')
            .insert({
                supplier_id: user.id,
                document_type: document_type,
                document_url: publicUrl,
                document_name: file.name,
                expiry_date: expiryDate || null, // Save expiry date
                verification_status: 'Pending', // Set to Pending by default
            })
            .select();

        console.log('Inserted Document:', insertedData);
        console.log('Insert Error:', dbError);

        if (dbError) {
            console.error('Database error:', dbError);
            return NextResponse.json({ error: "Failed to save document record" }, { status: 500 });
        }

        // ALSO update profiles.documents for backward compatibility
        const { data: profile } = await supabase
            .from('profiles')
            .select('documents')
            .eq('id', user.id)
            .single();

        const documents = profile?.documents || {};
        documents[docType] = {
            url: publicUrl,
            status: 'Pending',
            uploaded_at: new Date().toISOString(),
            expiry_date: expiryDate || null,
        };

        await supabase
            .from('profiles')
            .update({ documents })
            .eq('id', user.id);

        return NextResponse.json({ success: true, url: publicUrl });
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
