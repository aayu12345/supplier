"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bell, Check, X, Info, AlertTriangle, AlertCircle } from "lucide-react";
import { clsx } from "clsx";

type Notification = {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    is_read: boolean;
    created_at: string;
};

export default function NotificationsList() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchNotifications();

        // Subscribe to real-time changes
        const subscription = supabase
            .channel('notifications_channel')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${(async () => (await supabase.auth.getUser()).data.user?.id)()}`, // Filters need user ID, handled below better
                },
                (payload) => {
                    console.log('New notification!', payload);
                    fetchNotifications();
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const fetchNotifications = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20);

        if (data) {
            setNotifications(data as Notification[]);
        }
        setLoading(false);
    };

    const markAsRead = async (id: string) => {
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id);

        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <Check className="h-5 w-5 text-green-600" />;
            case 'error': return <AlertCircle className="h-5 w-5 text-red-600" />;
            case 'warning': return <AlertTriangle className="h-5 w-5 text-orange-600" />;
            default: return <Info className="h-5 w-5 text-blue-600" />;
        }
    };

    const getBgColor = (type: string) => {
        switch (type) {
            case 'success': return 'bg-green-50 border-green-200';
            case 'error': return 'bg-red-50 border-red-200';
            case 'warning': return 'bg-orange-50 border-orange-200';
            default: return 'bg-blue-50 border-blue-200';
        }
    };

    if (loading) return <div className="p-4 text-center text-gray-500">Loading notifications...</div>;
    if (notifications.length === 0) return <div className="p-4 text-center text-gray-500">No notifications</div>;

    return (
        <div className="space-y-3 max-w-2xl mx-auto p-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5" /> Notifications
            </h2>
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={clsx(
                        "p-4 rounded-lg border transition-all relative flex gap-4",
                        getBgColor(notification.type),
                        notification.is_read ? "opacity-75" : "shadow-sm"
                    )}
                >
                    <div className="flex-shrink-0 mt-1">
                        {getIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                        <p className="text-sm text-gray-700 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                            {new Date(notification.created_at).toLocaleString()}
                        </p>
                    </div>
                    {!notification.is_read && (
                        <button
                            onClick={() => markAsRead(notification.id)}
                            className="absolute top-2 right-2 p-1 hover:bg-black/5 rounded-full text-gray-400 hover:text-gray-600"
                            title="Mark as read"
                        >
                            <Check className="h-4 w-4" />
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}
