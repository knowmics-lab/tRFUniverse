import { ReactElement } from "react";
import SideNav from "@/components/layouts/mainLayout/SideNav";
import { NotificationsContainer } from "@/components/layouts/mainLayout/NotificationsContainer";
import usePendingAnalyses from "@/hooks/usePendingAnalyses";

export default function MainLayout(page: ReactElement) {
    usePendingAnalyses();
    return (
        <>
            <div className="min-height-300 bg-primary position-absolute w-100"></div>
            <NotificationsContainer />
            <SideNav />
            <main className="main-content position-relative border-radius-lg">{page}</main>
        </>
    );
}
