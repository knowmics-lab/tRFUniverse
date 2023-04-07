import type { NextPage } from "next";
import Head from "next/head";
import { Container } from "react-bootstrap";
import MainHeader from "@/components/layouts/mainLayout/MainHeader";
import MainFooter from "@/components/layouts/mainLayout/MainFooter";
import { defaultTitle, twoLevelBreadcrumb } from "@/utils";
import { Suspense } from "react";
import Loading from "@/components/Loading";
import DifferentialExpression from "@/components/analysis/DifferentialExpression";

const DifferentialExpressionPage: NextPage = () => {
    return (
        <Container fluid className="py-4">
            <Head>
                <title>{defaultTitle("Differential Expression Analysis")}</title>
            </Head>
            <MainHeader
                pageTitle="Differential Expression"
                breadcrumbs={twoLevelBreadcrumb("Analysis", "/analysis", "Differential Expression")}
            />
            <div className="card shadow-lg mx-4 card-profile-bottom" style={{ marginTop: "10.5rem" }}>
                <div className="card-body p-3">
                    <div className="row gx-4">
                        <div className="col-auto my-auto ms-2">
                            <div className="h-100 d-flex align-items-center">
                                <h5 className="mb-1">Differential Expression</h5>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Suspense fallback={<Loading />}>
                <DifferentialExpression />
            </Suspense>
            <MainFooter />
        </Container>
    );
};

export default DifferentialExpressionPage;
