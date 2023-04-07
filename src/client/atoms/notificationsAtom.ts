import { atom, PrimitiveAtom } from "jotai";
import { Notification } from "@/types";

export const notificationsAtom = atom<PrimitiveAtom<Notification>[]>([]);
export const unreadNotificationsAtom = atom<PrimitiveAtom<Notification>[]>((get) => {
    const notifications = get(notificationsAtom);
    return notifications.filter((n) => !get(n).read);
});
export const notificationAtom = (notification: Notification) => atom<Notification>(notification);
