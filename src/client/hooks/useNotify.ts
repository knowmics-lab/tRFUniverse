import { Notification } from "@/types";
import { useSetAtom } from "jotai";
import { notificationAtom, notificationsAtom } from "@/atoms";
import { v4 as uuidv4 } from "uuid";
import { useCallback } from "react";

export const makeNotification = (notification: Omit<Notification, "id" | "createdAt" | "read">): Notification => ({
    id: uuidv4(),
    ...notification,
    createdAt: new Date(),
});

export default function useNotify() {
    const setNotifications = useSetAtom(notificationsAtom);
    return useCallback(
        (params: Omit<Notification, "id" | "createdAt" | "read">) => {
            const notification = makeNotification(params);
            setNotifications((notifications) => [...notifications, notificationAtom(notification)]);
            return notification.id;
        },
        [setNotifications],
    );
}
