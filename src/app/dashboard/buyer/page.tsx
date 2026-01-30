import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BuyerDashboardClient from "@/components/dashboard/buyer/BuyerDashboardClient";

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function BuyerDashboard(props: Props) {
    const searchParams = await props.searchParams;
    const soup = await createClient();

    const {
        data: { user },
    } = await soup.auth.getUser();

    // Fetch profile for name, default to email username if name not found in metadata
    const userName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Guest";
    const shouldOpenModal = searchParams?.action === "upload";

    return <BuyerDashboardClient userName={userName} isLoggedIn={!!user} shouldOpenModal={shouldOpenModal} />;
}
