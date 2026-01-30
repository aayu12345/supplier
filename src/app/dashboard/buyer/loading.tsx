export default function Loading() {
    return (
        <div className="space-y-6">
            <div className="h-8 bg-gray-100 rounded w-48 animate-pulse" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Hero Banner Skeleton */}
                <div className="md:col-span-2 h-48 bg-gray-100 rounded-2xl animate-pulse" />
                {/* Activity Skeleton */}
                <div className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
            </div>

            {/* Table Skeleton */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-64 animate-pulse" />
        </div>
    );
}
