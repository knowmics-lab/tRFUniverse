import type { NextPage } from "next";
import Head from "next/head";
import { Card, Container } from "react-bootstrap";
import MainHeader from "@/components/layouts/mainLayout/MainHeader";
import MainFooter from "@/components/layouts/mainLayout/MainFooter";
import { defaultBreadcrumb, defaultTitle } from "@/utils";
import FragmentDataTable from "@/components/FragmentDataTable";

const FragmentsIndex: NextPage = () => {
    return (
        <Container fluid className="py-4">
            <Head>
                <title>{defaultTitle("Browse Fragments")}</title>
            </Head>
            <MainHeader pageTitle="Browse" breadcrumbs={defaultBreadcrumb("Browse")} />
            <Card className="p-3 border-radius-xl bg-white mt-md-7">
                <FragmentDataTable endpoint="fragments" />
            </Card>
            <MainFooter />
        </Container>
    );
};

export default FragmentsIndex;
