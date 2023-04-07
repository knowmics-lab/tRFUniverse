import type { NextPage } from "next";
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next";
import Head from "next/head";
import { Container, Nav, Tab } from "react-bootstrap";
import MainHeader from "@/components/layouts/mainLayout/MainHeader";
import MainFooter from "@/components/layouts/mainLayout/MainFooter";
import { defaultTitle, twoLevelBreadcrumb } from "@/utils";
import { fragmentFetcher, fragmentIdsFetcher } from "@/fetchers";
import { Suspense, useId, useState } from "react";
import TranscriptsTab from "@/components/fragments/TranscriptsTab";
import ExpressionsTab from "@/components/fragments/ExpressionsTab";
import Loading from "@/components/Loading";
import TargetsTab from "@/components/fragments/TargetsTab";
import SurvivalTab from "@/components/fragments/SurvivalTab";
import {
    faBarsStaggered,
    faBullseye,
    faChartLine,
    faChartPie,
    faIdCard,
    faWrench,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AliasesTab from "@/components/fragments/AliasesTab";
import AnalyzeTab from "@/components/fragments/AnalyzeTab";
import useHash from "@/hooks/useHash";
import { Fragment } from "@/types";
import { useEffectOnce } from "react-use";

type StaticPropsType = {
    fragment: Fragment;
};

export const getStaticProps: GetStaticProps<StaticPropsType> = async (context) => {
    const { id } = context.params as { id: string };
    const { data } = await fragmentFetcher({ fragmentId: Number(id) });
    return {
        props: { fragment: data },
    };
};

export const getStaticPaths: GetStaticPaths = async () => {
    const ids = await fragmentIdsFetcher();
    return {
        paths: ids.data.map((id) => ({ params: { id: `${id}` } })),
        fallback: false, // can also be true or 'blocking'
    };
};

enum Tabs {
    ALIASES = "tab-aliases",
    TRANSCRIPTS = "tab-transcripts",
    EXPRESSIONS = "tab-expressions",
    SURVIVAL = "tab-survival",
    TARGETS = "tab-targets",
    ANALYZE = "tab-analyze",
}

type PropsType = InferGetStaticPropsType<typeof getStaticProps>;

const MainContainer: NextPage<PropsType> = ({ fragment }) => {
    const hash = useHash(true);
    const tabId = useId();
    const [key, setKey] = useState<Tabs>(Tabs.TRANSCRIPTS);
    useEffectOnce(() => {
        if (hash) {
            if (["ce-", "ct-", "mct-", "te-", "ph-"].some((prefix) => hash.startsWith(prefix))) {
                setKey(Tabs.ANALYZE);
            }
            if (hash.startsWith("saf-")) {
                setKey(Tabs.SURVIVAL);
            }
            if (hash.startsWith("exg-")) {
                setKey(Tabs.EXPRESSIONS);
            }
        }
    });
    return (
        <>
            <Head>
                <title>{defaultTitle(fragment.name)}</title>
            </Head>
            <MainHeader
                pageTitle={fragment.name}
                breadcrumbs={twoLevelBreadcrumb("Fragments", "/fragments", fragment.name)}
            />
            <Tab.Container id={tabId} activeKey={key} onSelect={(k) => setKey(k as Tabs)} transition={false}>
                <div className="card shadow-lg mx-4 card-profile-bottom" style={{ marginTop: "9rem" }}>
                    <div className="card-body p-3">
                        <div className="row gx-4">
                            <div className="col-auto my-auto ms-2">
                                <div className="h-100">
                                    <h5 className="mb-1">{fragment.name}</h5>
                                    <p className="mb-0 font-weight-bold text-sm">
                                        {fragment.type === "NA" ? <>&mdash;</> : fragment.type}
                                    </p>
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
                                                eventKey={Tabs.TRANSCRIPTS}
                                            >
                                                <FontAwesomeIcon icon={faBarsStaggered} className="m-0" />
                                                <span className="ms-2">Transcripts</span>
                                            </Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item as="li">
                                            <Nav.Link
                                                className="mb-0 px-0 py-1 d-flex align-items-center justify-content-center"
                                                eventKey={Tabs.ALIASES}
                                            >
                                                <FontAwesomeIcon icon={faIdCard} className="m-0" />
                                                <span className="ms-2">Aliases</span>
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
                                        <Nav.Item as="li">
                                            <Nav.Link
                                                className="mb-0 px-0 py-1 d-flex align-items-center justify-content-center"
                                                eventKey={Tabs.SURVIVAL}
                                            >
                                                <FontAwesomeIcon icon={faChartPie} className="m-0" />
                                                <span className="ms-2">Survival</span>
                                            </Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item as="li">
                                            <Nav.Link
                                                className="mb-0 px-0 py-1 d-flex align-items-center justify-content-center"
                                                eventKey={Tabs.TARGETS}
                                            >
                                                <FontAwesomeIcon icon={faBullseye} className="m-0" />
                                                <span className="ms-2">Targets</span>
                                            </Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item as="li">
                                            <Nav.Link
                                                className="mb-0 px-0 py-1 d-flex align-items-center justify-content-center"
                                                eventKey={Tabs.ANALYZE}
                                            >
                                                <FontAwesomeIcon icon={faWrench} className="m-0" />
                                                <span className="ms-2">Analyze</span>
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
                            {key === Tabs.ALIASES && <AliasesTab synonyms={fragment.synonyms ?? []} />}
                            {key === Tabs.TRANSCRIPTS && <TranscriptsTab transcripts={fragment.positions} />}
                            {key === Tabs.EXPRESSIONS && (
                                <ExpressionsTab fragmentId={fragment.id} datasets={fragment.expressed_in} />
                            )}
                            {key === Tabs.SURVIVAL && (
                                <SurvivalTab fragmentId={fragment.id} datasets={fragment.expressed_in} />
                            )}
                            {key === Tabs.TARGETS && <TargetsTab fragmentId={fragment.id} />}
                            {key === Tabs.ANALYZE && (
                                <AnalyzeTab fragment={fragment} expressedIn={fragment.expressed_in} />
                            )}
                        </Suspense>
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>
        </>
    );
};

const FragmentPage: NextPage<StaticPropsType> = (props) => {
    return (
        <Container fluid className="py-4">
            <MainContainer {...props} />
            <MainFooter />
        </Container>
    );
};

export default FragmentPage;
