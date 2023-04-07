import { PropsWithChildren, useContext, useEffect, useRef } from "react";
import { useToggle } from "@/hooks/commons";
import NavContext from "@restart/ui/NavContext";
import { Collapse, Nav } from "react-bootstrap";
import clsx from "clsx";
import classes from "@/components/layouts/mainLayout/SideNav.module.css";
import SideNavSubMenuContext from "@/components/layouts/mainLayout/sideNav/SideNavSubMenuContext";

type NavSubMenuProps = PropsWithChildren<{
    icon?: string;
    text: string;
    color?: string;
}>;

export default function SideNavSubMenu({ icon, text, color, children }: NavSubMenuProps) {
    const subscribedItemsRef = useRef<string[]>([]);
    const [isActive, toggleActive] = useToggle();
    const [isOpen, toggleOpen] = useToggle();
    const navContext = useContext(NavContext);
    const subMenuContext = useContext(SideNavSubMenuContext);
    useEffect(() => {
        if (subscribedItemsRef.current.some((item) => navContext?.activeKey === item)) {
            toggleActive(true);
            toggleOpen(true);
        } else {
            toggleActive(false);
            toggleOpen(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navContext?.activeKey]);
    return (
        <Nav.Item as="li">
            <Nav.Link
                href="#"
                data-bs-toggle="collapse"
                aria-expanded={isOpen}
                className={clsx("nav-link", {
                    collapsed: !isOpen,
                    active: isActive,
                })}
                onClick={(e) => {
                    e.preventDefault();
                    toggleOpen();
                }}
            >
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
            <Collapse in={isOpen}>
                <div>
                    <SideNavSubMenuContext.Provider
                        value={{
                            subscribe: (key) => {
                                subscribedItemsRef.current.push(key);
                                const unsubscribe = subMenuContext?.subscribe(key);
                                return () => {
                                    subscribedItemsRef.current = subscribedItemsRef.current.filter(
                                        (item) => item !== key,
                                    );
                                    unsubscribe?.();
                                };
                            },
                        }}
                    >
                        <ul className="nav ms-4">{children}</ul>
                    </SideNavSubMenuContext.Provider>
                </div>
            </Collapse>
        </Nav.Item>
    );
}
