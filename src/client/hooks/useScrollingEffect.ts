import { Ref, useLayoutEffect, useRef } from "react";

export default function useScrollingEffect<E extends HTMLElement>(observedData: any): Ref<E> {
    const scrollToRef = useRef<E>();
    useLayoutEffect(() => {
        if (scrollToRef.current && observedData) {
            scrollToRef.current.scrollIntoView({
                behavior: "smooth",
            });
        }
    }, [observedData]);
    return scrollToRef as Ref<E>;
}
