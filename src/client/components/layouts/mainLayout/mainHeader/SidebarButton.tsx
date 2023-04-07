import React, { useId } from "react";
import { sidebarAtom } from "@/atoms";
import { useAtom } from "jotai";

export default function SidebarButton() {
    const iconNavbarId = useId();
    const [shown, updateShown] = useAtom(sidebarAtom);
    return (
        <li className="nav-item d-xl-none ps-3 d-flex align-items-center">
            <a
                href="@/components/layouts/mainLayout/mainHeader/SidebarButton#"
                className="nav-link text-white p-0"
                id={iconNavbarId}
                onClick={(e) => {
                    e.preventDefault();
                    updateShown(!shown);
                }}
            >
                <div className="sidenav-toggler-inner">
                    <i className="sidenav-toggler-line bg-white"></i>
                    <i className="sidenav-toggler-line bg-white"></i>
                    <i className="sidenav-toggler-line bg-white"></i>
                </div>
            </a>
        </li>
    );
}