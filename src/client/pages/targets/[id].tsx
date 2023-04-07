import type { GetStaticPaths, GetStaticProps, InferGetStaticPropsType, NextPage } from "next";
import Head from "next/head";
import { Container, Nav, Tab } from "react-bootstrap";
import MainHeader from "@/components/layouts/mainLayout/MainHeader";
import MainFooter from "@/components/layouts/mainLayout/MainFooter";
import { defaultTitle, twoLevelBreadcrumb } from "@/utils";
import { targetFetcher } from "@/fetchers";
import { Suspense, useId, useMemo, useState } from "react";
import Loading from "@/components/Loading";
import TargetExpressionPlot from "@/components/targets/TargetExpressionPlot";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBullseye, faChartLine } from "@fortawesome/free-solid-svg-icons";
import { Target } from "@/types";
import BindingSitesTable from "@/components/targets/BindingSitesTable";

type StaticPropsType = {
    target: Target;
};

export const getStaticProps: GetStaticProps<StaticPropsType> = async (context) => {
    const { id } = context.params as { id: string };
    try {
        const { data } = await targetFetcher({ targetId: Number(id) });
        return {
            props: { target: data },
        };
    } catch (e) {
        return {
            notFound: true,
        };
    }
};

export const getStaticPaths: GetStaticPaths = async () => {
    // const ids = await targetIdsFetcher();
    return {
        paths: [], //ids.data.map((id) => ({ params: { id: `${id}` } })),
        fallback: "blocking",
    };
};

// export const getServerSideProps: GetServerSideProps<StaticPropsType, { id: string }> = async (context) => {
//     const { id } = context.params ?? { id: "" };
//     try {
//         const { data: target } = await targetFetcher({ targetId: Number(id) });
//         if (process && process.env.NODE_ENV !== "development") {
//             context.res.setHeader("Cache-Control", "public, s-maxage=604800, stale-while-revalidate=86400");
//         }
//         return {
//             props: { target },
//         };
//     } catch (e) {
//         return {
//             notFound: true,
//         };
//     }
// };

enum Tabs {
    BINDING_SITES = "tab-binding-sites",
    EXPRESSIONS = "tab-expressions",
}

// type PropsType = InferGetServerSidePropsType<typeof getServerSideProps>;
type PropsType = InferGetStaticPropsType<typeof getStaticProps>;

const TargetPage: NextPage<PropsType> = ({ target }) => {
    const tabId = useId();
    const [key, setKey] = useState<Tabs>(Tabs.BINDING_SITES);
    const pageTitle = useMemo(() => `Target ${target.fragment_name} - ${target.gene_name}`, [target]);
    return (
        <Container fluid className="py-4">
            <Head>
                <title>{defaultTitle(pageTitle)}</title>
            </Head>
            <MainHeader pageTitle={pageTitle} breadcrumbs={twoLevelBreadcrumb("Targets", "/targets", pageTitle)} />
            <Tab.Container id={tabId} activeKey={key} onSelect={(k) => setKey(k as Tabs)} transition={false}>
                <div className="card shadow-lg mx-4 card-profile-bottom" style={{ marginTop: "9rem" }}>
                    <div className="card-body p-3">
                        <div className="row gx-4">
                            <div className="col-auto my-auto ms-2">
                                <div className="h-100">
                                    <h5 className="mb-1">{pageTitle}</h5>
                                    <p className="mb-0 font-weight-bold text-sm">{target.count} binding sites</p>
                                </div>
                            </div>
                            <div className="col-lg-6 col-md-8 my-sm-auto ms-sm-auto me-sm-0 mx-auto mt-3">
                                <div className="nav-wrapper position-relative end-0">
                                    <Nav
                                        as="ul"
                                        variant="pills"
                                        fill
                                        className="p-1 flex-column flex-md-row header-tab"
                                    >
                                        <Nav.Item as="li">
                                            <Nav.Link
                                                className="mb-0 px-0 py-1 d-flex align-items-center justify-content-center"
                                                eventKey={Tabs.BINDING_SITES}
                                            >
                                                <FontAwesomeIcon icon={faBullseye} className="m-0" />
                                                <span className="ms-2">Binding Sites</span>
                                            </Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item as="li">
                                            <Nav.Link
                                                className="mb-0 px-0 py-1 d-flex align-items-center justify-content-center"
                                                eventKey={Tabs.EXPRESSIONS}
                                            >
                                                <FontAwesomeIcon icon={faChartLine} className="m-0" />
                                                <span className="ms-2">Expression</span>
                                            </Nav.Link>
                                        </Nav.Item>
                                    </Nav>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Tab.Content>
                    <Tab.Pane eventKey={key}>
                        <Suspense fallback={<Loading />}>
                            {key === Tabs.BINDING_SITES && <BindingSitesTable target={target} />}
                            {key === Tabs.EXPRESSIONS && <TargetExpressionPlot target={target} />}
                        </Suspense>
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>
            <MainFooter />
        </Container>
    );
};

export default TargetPage;
