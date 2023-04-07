import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";

const getHashValue = (s: string) => s.split("#")[1];

export default function useHash(onlyOnMount = false) {
    const router = useRouter();
    const [hash, setHash] = useState(typeof window !== "undefined" ? getHashValue(window.location.hash) : "");
    const updateHash = useCallback((s: string) => {
        setHash(getHashValue(s));
    }, []);

    useEffect(() => {
        const onWindowHashChange = () => updateHash(window.location.hash);
        const onNextJSHashChange = (url: string) => updateHash(url);

        if (!onlyOnMount) {
            router.events.on("hashChangeStart", onNextJSHashChange);
            window.addEventListener("hashchange", onWindowHashChange);
        }
        window.addEventListener("load", onWindowHashChange);
        return () => {
            if (!onlyOnMount) {
                router.events.off("hashChangeStart", onNextJSHashChange);
                window.removeEventListener("load", onWindowHashChange);
            }
            window.removeEventListener("hashchange", onWindowHashChange);
        };
    }, [onlyOnMount, router.asPath, router.events, updateHash]);

    return hash;
}
