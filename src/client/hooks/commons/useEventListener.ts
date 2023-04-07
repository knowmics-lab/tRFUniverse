import { useEffect, useRef } from "react";

type IndexAwareEventListener = (evt: Event, index: number) => void;

export function useEventListeners(
    eventType: string,
    callback: IndexAwareEventListener,
    elements: (EventTarget | undefined)[],
) {
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        const availableElements = elements.filter((el) => el != null) as EventTarget[];
        const handlers = availableElements.map((el, index) => (evt: Event) => callbackRef.current(evt, index));
        availableElements.map((el, index) => el.addEventListener(eventType, handlers[index]));

        return () => availableElements.forEach((el, index) => el.removeEventListener(eventType, handlers[index]));
    }, [eventType, elements]);
}

export function useEventListener(
    eventType: string,
    callback: EventListenerOrEventListenerObject,
    element?: EventTarget,
) {
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        let domElement = element;
        if (!domElement && typeof window !== "undefined") {
            domElement = window;
        }
        if (domElement == null) return;
        const handler = (e: Event) => {
            if (typeof callbackRef.current === "object") {
                callbackRef.current.handleEvent(e);
            } else {
                callbackRef.current(e);
            }
        };
        domElement.addEventListener(eventType, handler);

        return () => {
            if (domElement == null) return;
            domElement.removeEventListener(eventType, handler);
        };
    }, [eventType, element]);
}
