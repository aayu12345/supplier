import { createClient } from "@/lib/supabase/server";

export default async function TestDB() {
    const supabase = await createClient();

    // Attempt to get the session to verify connection
    const { data, error } = await supabase.auth.getSession();

    return (
        <div className="p-12">
            <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>

            <div className="p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
                <div>
                    <span className="font-semibold">Status: </span>
                    {error ? (
                        <span className="text-red-600 bg-red-50 px-2 py-1 rounded">
                            Connection Failed
                        </span>
                    ) : (
                        <span className="text-green-600 bg-green-50 px-2 py-1 rounded">
                            Connected Successfully
                        </span>
                    )}
                </div>

                <div>
                    <span className="font-semibold">Supabase URL: </span>
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {process.env.NEXT_PUBLIC_SUPABASE_URL ? "Defined" : "Missing"}
                    </code>
                </div>

                <div>
                    <span className="font-semibold">Supabase Key: </span>
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Defined" : "Missing"}
                    </code>
                </div>

                {error && (
                    <div className="text-red-600 text-sm bg-red-50 p-4 rounded">
                        Error Details: {error.message}
                    </div>
                )}

                {!error && (
                    <div className="text-green-600 text-sm bg-green-50 p-4 rounded">
                        Supabase client initialized without error. Session fetch attempted.
                    </div>
                )}
            </div>
        </div>
    );
}
