import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Test endpoint to check if storage bucket exists and is accessible
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({
                error: "Not authenticated",
                details: authError?.message
            }, { status: 401 });
        }

        // Try to list files in the bucket (this will fail if bucket doesn't exist)
        const { data: files, error: listError } = await supabase.storage
            .from('supplier-documents')
            .list();

        if (listError) {
            return NextResponse.json({
                success: false,
                error: "Bucket access failed",
                details: listError.message,
                errorCode: listError.statusCode,
                user: {
                    id: user.id,
                    email: user.email
                }
            });
        }

        return NextResponse.json({
            success: true,
            message: "Bucket exists and is accessible",
            fileCount: files?.length || 0,
            user: {
                id: user.id,
                email: user.email
            }
        });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: "Server error",
            details: error.message
        }, { status: 500 });
    }
}
