import { useEffect, useState } from "react";
import { useEventListener, useEventListeners } from "./useEventListener";

export default function useMediaQueries(mediaQueries: string[]) {
    const hasWindow = typeof window !== "undefined";
    const [matches, setMatches] = useState<boolean[]>(new Array(mediaQueries.length).fill(false));
    const [mediaQueryLists, setMediaQueryLists] = useState<(MediaQueryList | undefined)[]>(
        new Array(mediaQueries.length).fill(undefined),
    );

    useEffect(() => {
        if (!hasWindow) return;
        const list = mediaQueries.map((query) => window.matchMedia(query));
        setMediaQueryLists(list);
        setMatches(list.map((mql) => mql.matches));
    }, [hasWindow, mediaQueries]);

    useEventListeners(
        "change",
        (evt: Event, index: number) => {
            const e = evt as MediaQueryListEvent;
            setMatches((matches) => {
                const newMatches = [...matches];
                newMatches[index] = e.matches;
                return newMatches;
            });
        },
        mediaQueryLists,
    );

    return matches;
}

export function useMediaQuery(mediaQuery: string) {
    const hasWindow = typeof window !== "undefined";
    const [isMatch, setIsMatch] = useState(false);
    const [mediaQueryList, setMediaQueryList] = useState<MediaQueryList>();

    useEffect(() => {
        if (!hasWindow) return;
        const list = window.matchMedia(mediaQuery);
        setMediaQueryList(list);
        setIsMatch(list.matches);
    }, [hasWindow, mediaQuery]);

    useEventListener("change", (e) => setIsMatch((e as MediaQueryListEvent).matches), mediaQueryList);

    return isMatch;
}
