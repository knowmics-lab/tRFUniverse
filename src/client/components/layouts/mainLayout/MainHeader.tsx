import Link from "next/link";
import React, { useId } from "react";
import type { BreadcrumbItem } from "@/types";
import { Nav, Navbar } from "react-bootstrap";
import SearchForm from "@/components/layouts/mainLayout/mainHeader/SearchForm";
import SidebarButton from "@/components/layouts/mainLayout/mainHeader/SidebarButton";

type MainHeaderProps = {
    pageTitle?: string;
    breadcrumbs?: BreadcrumbItem[];
};

export default function MainHeader({ pageTitle, breadcrumbs }: MainHeaderProps) {
    const idBase = useId();
    return (
        <nav
            className="navbar navbar-main navbar-expand-lg px-0 mx-4 shadow-none border-radius-xl "
            id="navbarBlur"
            data-scroll="false"
        >
            <div className="container-fluid py-1 px-3">
                <nav aria-label="breadcrumb">
                    {breadcrumbs && (
                        <ol className="breadcrumb bg-transparent mb-0 pb-0 pt-1 px-0 me-sm-6 me-5">
                            {breadcrumbs.map(({ href, text, active }, index) => (
                                <React.Fragment key={`${idBase}-${index}`}>
                                    {!active && (
                                        <li className="breadcrumb-item text-sm">
                                            <Link href={href}>
                                                <a className="opacity-5 text-white">{text}</a>
                                            </Link>
                                        </li>
                                    )}
                                    {active && (
                                        <li className="breadcrumb-item text-sm text-white active" aria-current="page">
                                            {text}
                                        </li>
                                    )}
                                </React.Fragment>
                            ))}
                        </ol>
                    )}
                    {!breadcrumbs && <div className="bg-transparent mb-0 pb-0 pt-1 px-0 me-sm-6 me-5">&nbsp;</div>}
                    {pageTitle && <h6 className="font-weight-bolder text-white mb-0">{pageTitle}</h6>}
                </nav>
                <Navbar.Collapse className="mt-sm-0 mt-2 me-md-0 me-sm-4" id="navbar">
                    <SearchForm />
                    <Nav as="ul" className="navbar-nav justify-content-end">
                        <SidebarButton />
                    </Nav>
                </Navbar.Collapse>
            </div>
        </nav>
    );
}