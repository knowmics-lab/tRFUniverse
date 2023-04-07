import React, { useEffect } from "react";
import { useAtom } from "jotai";
import { sidebarAtom } from "@/atoms";

export default function SidebarHandler() {
    const [shown] = useAtom(sidebarAtom);

    useEffect(() => {
        document.body.classList.toggle("g-sidenav-pinned", shown);
        document.getElementById("sidenav-main")?.classList.toggle("bg-white", shown);
        document.getElementById("sidenav-main")?.classList.toggle("bg-default", !shown);
    }, [shown]);

    return <></>;
}