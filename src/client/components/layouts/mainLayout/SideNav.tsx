import { Nav, Navbar } from "react-bootstrap";
import { useRouter } from "next/router";
import Image from "next/image";
import NavSubMenu from "./sideNav/SideNavSubMenu";
import NavItemLink from "./sideNav/SideNavItemLink";
import SearchForm from "@/components/layouts/mainLayout/mainHeader/SearchForm";
import { pathWithoutId } from "@/utils";
import { useMemo } from "react";

export default function SideNav() {
    const router = useRouter();
    const currentPath = useMemo(() => pathWithoutId(router.asPath), [router.asPath]);
    return (
        <Navbar
            id="sidenav-main"
            as="aside"
            expand="xs"
            bg="default"
            variant="dark"
            className="sidenav navbar-vertical border-0 border-radius-xl my-3 fixed-start ms-4"
        >
            <div className="sidenav-header">
                <i
                    className="fas fa-times p-3 cursor-pointer text-secondary opacity-5 position-absolute end-0 top-0 d-none d-xl-none"
                    aria-hidden="true"
                    id="iconSidenav"
                />
                <a className="navbar-brand m-0 mt-4 position-relative" href="https://trfuniverse.cloud/">
                    <Image
                        src="/assets/trfuniverse-logo.png"
                        alt="tRFUniverse"
                        layout="fill"
                        objectFit="contain"
                        className="d-none d-lg-block"
                    />
                    <Image
                        src="/assets/trfuniverse-logo-black.png"
                        alt="tRFUniverse"
                        layout="fill"
                        objectFit="contain"
                        className="d-block d-lg-none"
                    />
                </a>
            </div>
            <hr className="horizontal dark mt-0 mb-0 mb-md-auto" />
            <SearchForm className="d-md-none p-2 mt-0" />
            <hr className="horizontal dark mt-0 d-md-none" />
            <Navbar.Collapse className="w-auto" id="sidenav-collapse-main">
                <Nav as="ul" activeKey={currentPath}>
                    <NavItemLink href="/" icon="fa fa-house" text="Home" />
                    <NavItemLink
                        href="/search"
                        icon="fa-solid fa-magnifying-glass"
                        color="text-success"
                        text="Search"
                    />
                    <NavItemLink href="/fragments" icon="fa fa-folder-open" color="text-warning" text="Browse" />
                    <NavSubMenu icon="fa fa-magnifying-glass-chart" color="text-info" text="Analysis">
                        <NavItemLink href="/analysis/dimensionality-reduction" text="Dimensionality Reduction" />
                        <NavItemLink href="/analysis/clustering" text="Clustering" />
                        <NavItemLink href="/analysis/differential-expression" text="Differential Expression" />
                        <NavItemLink href="/analysis/differential-survival" text="Differential Survival" />
                    </NavSubMenu>
                    <NavItemLink href="/targets" icon="fa fa-bullseye" color="text-danger" text="Targets" />
                    <NavItemLink href="/downloads" icon="fa fa-download" color="text-success" text="Downloads" />
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
}
