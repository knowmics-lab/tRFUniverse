import { Spinner } from "react-bootstrap";
import Head from "next/head";
import { defaultBreadcrumb, defaultTitle } from "@/utils";
import MainHeader from "@/components/layouts/mainLayout/MainHeader";
import MainFooter from "@/components/layouts/mainLayout/MainFooter";

type LoadingProps = {
    message?: string;
};

export default function Loading({ message = "Loading..." }: LoadingProps) {
    return (
        <div className="d-flex justify-content-center align-items-center w-100 h-100 gap-2">
            <Spinner animation={"border"} variant={"primary"} />
            {message !== "" && <div>{message}</div>}
        </div>
    );
}

export function LoadingPage() {
    return (
        <>
            <Head>
                <title>{defaultTitle("Loading...")}</title>
            </Head>
            <MainHeader pageTitle="Loading..." breadcrumbs={defaultBreadcrumb("Loading...")} />
            <div
                className="card shadow-lg my-8 mx-4 card-profile-bottom d-flex align-items-center justify-content-center"
                style={{ height: "9rem" }}
            >
                <Loading />
            </div>
            <MainFooter />
        </>
    );
}
