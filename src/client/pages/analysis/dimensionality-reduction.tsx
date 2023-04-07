import type { NextPage } from "next";
import Head from "next/head";
import { Container } from "react-bootstrap";
import MainHeader from "@/components/layouts/mainLayout/MainHeader";
import MainFooter from "@/components/layouts/mainLayout/MainFooter";
import { defaultTitle, twoLevelBreadcrumb } from "@/utils";
import { Suspense } from "react";
import Loading from "@/components/Loading";
import DimensionalityReduction from "@/components/analysis/DimensionalityReduction";

const DimensionalityReductionPage: NextPage = () => {
    return (
        <Container fluid className="py-4">
            <Head>
                <title>{defaultTitle("Dimensionality Reduction")}</title>
            </Head>
            <MainHeader
                pageTitle="Dimensionality Reduction"
                breadcrumbs={twoLevelBreadcrumb("Analysis", "/analysis", "Dimensionality Reduction")}
            />
            <div className="card shadow-lg mx-4 card-profile-bottom" style={{ marginTop: "10.5rem" }}>
                <div className="card-body p-3">
                    <div className="row gx-4">
                        <div className="col-auto my-auto ms-2">
                            <div className="h-100 d-flex align-items-center">
                                <h5 className="mb-1">Dimensionality Reduction</h5>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Suspense fallback={<Loading />}>
                <DimensionalityReduction />
            </Suspense>
            <MainFooter />
        </Container>
    );
};

export default DimensionalityReductionPage;
