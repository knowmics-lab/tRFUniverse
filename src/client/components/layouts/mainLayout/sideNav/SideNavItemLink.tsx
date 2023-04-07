import { useContext, useEffect } from "react";
import { Nav } from "react-bootstrap";
import Link from "next/link";
import clsx from "clsx";
import classes from "@/components/layouts/mainLayout/SideNav.module.css";
import SideNavSubMenuContext from "@/components/layouts/mainLayout/sideNav/SideNavSubMenuContext";

type NavItemProps = {
    href: string;
    icon?: string;
    text: string;
    color?: string;
};

export default function SideNavItemLink({ href, icon, text, color }: NavItemProps) {
    const subMenuContext = useContext(SideNavSubMenuContext);
    useEffect(() => {
        return subMenuContext?.subscribe?.(href);
    }, [href, subMenuContext]);
    return (
        <Nav.Item as="li">
            <Link href={href} passHref>
                <Nav.Link>
                    {icon && (
                        <div className="icon icon-shape icon-sm border-radius-md text-center me-2 d-flex align-items-center justify-content-center">
                            <i
                                className={clsx(
                                    icon,
                                    color ?? "text-primary",
                                    classes["sidenav-icon"],
                                    "text-sm opacity-10",
                                )}
                            />
                        </div>
                    )}
                    {!icon && <span className="sidenav-mini-icon"> {text[0]} </span>}
                    <span className="nav-link-text ms-1">{text}</span>
                </Nav.Link>
            </Link>
        </Nav.Item>
    );
}
