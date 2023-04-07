import { SSRProvider } from "react-bootstrap";
import type { ReactElement, ReactNode } from "react";
import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import type { AppProps } from "next/app";
import MainLayout from "@/components/layouts/MainLayout";
import SidebarHandler from "@/components/layouts/mainLayout/SidebarHandler";
import "@/public/assets/css/argon-dashboard.min.css";
import "@/public/assets/css/nucleo-icons.css";
import "@/public/assets/css/nucleo-svg.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "react-bootstrap-typeahead/css/Typeahead.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";

config.autoAddCss = false;

if (typeof window === "undefined") React.useLayoutEffect = React.useEffect;

export type NextPageWithLayout<P = Record<string, unknown>, IP = P> = NextPage<P, IP> & {
    getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
    Component: NextPageWithLayout;
};

function LoadingWrapper() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const handleStart = (url: string) => url !== router.asPath && setLoading(true);
        const handleComplete = (url: string) => url === router.asPath && setLoading(false);
        router.events.on("routeChangeStart", handleStart);
        router.events.on("routeChangeComplete", handleComplete);
        router.events.on("routeChangeError", handleComplete);
        return () => {
            router.events.off("routeChangeStart", handleStart);
            router.events.off("routeChangeComplete", handleComplete);
            router.events.off("routeChangeError", handleComplete);
        };
    });
    return (
        <>
            {loading && (
                <div className="loading-wrapper">
                    <div className="d-flex justify-content-center align-items-center gap-2">
                        <h1 className="text-white">
                            <FontAwesomeIcon icon={faCircleNotch} spin />
                        </h1>
                        <h1 className="text-light">Loading...</h1>
                    </div>
                </div>
            )}
        </>
    );
}

export default function MyApp({ Component, pageProps }: AppPropsWithLayout) {
    const getLayout = Component.getLayout ?? MainLayout;

    return (
        <SSRProvider>
            <LoadingWrapper />
            <SidebarHandler />
            {getLayout(<Component {...pageProps} />)}
        </SSRProvider>
    );
}
