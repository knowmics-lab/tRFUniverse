import { Toast, ToastContainer } from "react-bootstrap";
import { PrimitiveAtom, useAtom } from "jotai";
import { unreadNotificationsAtom } from "@/atoms";
import { Notification } from "@/types";
import moment from "moment";
import Link from "next/link";
import { useCallback, useMemo } from "react";
import clsx from "clsx";

const TEXT_LIGHT = ["warning", "danger", "primary"];
const TEXT_DARK = ["success", "info"];

export function Notifications({ atom }: { atom: PrimitiveAtom<Notification> }) {
    const [notification, setNotification] = useAtom(atom);
    const isLight = useMemo(() => TEXT_LIGHT.includes(notification.type ?? ""), [notification.type]);
    const isDark = useMemo(() => TEXT_DARK.includes(notification.type ?? ""), [notification.type]);
    const markRead = useCallback(() => {
        setNotification((notification) => ({ ...notification, read: true }));
    }, [setNotification]);
    return (
        <Toast
            key={notification.id}
            onClose={() => {
                markRead();
            }}
            bg={notification.type}
        >
            <Toast.Header>
                <strong className="me-auto">{notification.title}</strong>
                <small>{moment(notification.createdAt).fromNow()}</small>
            </Toast.Header>
            <Toast.Body
                className={clsx({
                    "text-light": isLight,
                    "text-dark": isDark,
                })}
            >
                <span>{notification.message}</span>
                {notification.link && (
                    <>
                        {" "}
                        <Link href={notification.link}>
                            <a
                                className={clsx({
                                    "text-dark": isDark,
                                    "text-primary": !isLight && !isDark,
                                    "text-light": isLight,
                                    "text-decoration-underline": isLight || isDark,
                                })}
                                onClick={() => {
                                    markRead();
                                }}
                            >
                                See more&hellip;
                            </a>
                        </Link>
                    </>
                )}
                <span></span>
            </Toast.Body>
        </Toast>
    );
}

export function NotificationsContainer() {
    const [unreadNotifications] = useAtom(unreadNotificationsAtom);
    return (
        <div aria-live="polite" aria-atomic="true" className="position-absolute w-100" style={{ minHeight: "240px" }}>
            <ToastContainer position="top-end" className="p-3">
                {unreadNotifications.map((atom, index) => (
                    <Notifications atom={atom} key={index} />
                ))}
            </ToastContainer>
        </div>
    );
}
