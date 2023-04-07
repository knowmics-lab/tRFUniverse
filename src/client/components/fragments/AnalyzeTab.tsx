/* eslint-disable react-hooks/exhaustive-deps */
import { Card, Col, Nav, Row, Tab } from "react-bootstrap";
import { Fragment } from "@/types";
import { Suspense, useEffect, useId, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookReader, faBullseye, faProjectDiagram, faSmileBeam } from "@fortawesome/free-solid-svg-icons";
import Loading from "@/components/Loading";
import TargetEnrichmentTab from "@/components/fragments/analysis/TargetEnrichmentTab";
import CorrelationTab from "@/components/fragments/analysis/CorrelationTab";
import MediatedCorrelationTab from "@/components/fragments/analysis/MediatedCorrelationTab";
import CorrelatedEnrichmentTab from "@/components/fragments/analysis/CorrelatedEnrichmentTab";
import NetmeTab from "@/components/fragments/analysis/NetmeTab";
import useHash from "@/hooks/useHash";
import PHENSIMTab from "@/components/fragments/analysis/PHENSIMTab";

type AnalyzeTabProps = {
    fragment: Fragment;
    expressedIn: string[];
};

enum Tabs {
    ENRICHMENT_TARGETS = "tab-enrichment",
    CORRELATION = "tab-correlation",
    MEDIATED_CORRELATION = "tab-mediated-correlation",
    CORRELATED_ENRICHMENT = "tab-correlated-enrichment",
    NETME_TAB = "tab-netme",
    PHENSIM_TAB = "tab-phensim",
}

const TABS_MAP = {
    "ce-": Tabs.CORRELATED_ENRICHMENT,
    "ct-": Tabs.CORRELATION,
    "mct-": Tabs.MEDIATED_CORRELATION,
    "te-": Tabs.ENRICHMENT_TARGETS,
    "ph-": Tabs.PHENSIM_TAB,
};

export default function AnalyzeTab({ fragment, expressedIn }: AnalyzeTabProps) {
    const hash = useHash(true);
    const tabId = useId();
    const onlyNCI60 = useMemo(() => expressedIn.every((d) => d === "NCI60"), [expressedIn]);
    const [key, setKey] = useState<Tabs>(onlyNCI60 ? Tabs.CORRELATION : Tabs.ENRICHMENT_TARGETS);
    useEffect(() => {
        if (hash) {
            Object.entries(TABS_MAP)
                .filter(([prefix]) => hash.startsWith(prefix))
                .map(([, tab]) => setKey(tab));
        }
    }, []);
    return (
        <>
            <Tab.Container id={tabId} activeKey={key} onSelect={(k) => setKey(k as Tabs)}>
                <Row className="mx-4 mt-4 flex-column-reverse flex-md-row">
                    <Col xs={12} md={8} lg={9}>
                        <Tab.Content>
                            <Tab.Pane eventKey={key}>
                                <Suspense fallback={<Loading />}>
                                    {key === Tabs.ENRICHMENT_TARGETS && (
                                        <TargetEnrichmentTab fragmentId={fragment.id} expressedIn={expressedIn} />
                                    )}
                                    {key === Tabs.CORRELATION && (
                                        <CorrelationTab fragment={fragment.name} expressedIn={expressedIn} />
                                    )}
                                    {key === Tabs.MEDIATED_CORRELATION && (
                                        <MediatedCorrelationTab fragment={fragment.name} expressedIn={expressedIn} />
                                    )}
                                    {key === Tabs.CORRELATED_ENRICHMENT && (
                                        <CorrelatedEnrichmentTab fragment={fragment.name} expressedIn={expressedIn} />
                                    )}
                                    {key === Tabs.NETME_TAB && (
                                        <NetmeTab fragment={fragment.name} synonyms={fragment.synonyms ?? []} />
                                    )}
                                    {key === Tabs.PHENSIM_TAB && (
                                        <PHENSIMTab fragmentId={fragment.id} expressedIn={expressedIn} />
                                    )}
                                </Suspense>
                            </Tab.Pane>
                        </Tab.Content>
                    </Col>
                    <Col xs={12} md={4} lg={3}>
                        <Card className="shadow-lg border-radius-xl bg-white h-100">
                            <Nav variant="pills" className="flex-column header-tab h-100">
                                {!onlyNCI60 && (
                                    <Nav.Item>
                                        <Nav.Link eventKey={Tabs.ENRICHMENT_TARGETS}>
                                            <FontAwesomeIcon icon={faBullseye} className="m-0" />
                                            <span className="ms-2">Targets enrichment</span>
                                        </Nav.Link>
                                    </Nav.Item>
                                )}
                                <Nav.Item>
                                    <Nav.Link eventKey={Tabs.PHENSIM_TAB}>
                                        <FontAwesomeIcon icon={faSmileBeam} className="m-0" />
                                        <span className="ms-2">PHENSIM analysis</span>
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey={Tabs.CORRELATION}>
                                        <FontAwesomeIcon icon={faProjectDiagram} className="m-0" />
                                        <span className="ms-2">Correlation</span>
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey={Tabs.MEDIATED_CORRELATION}>
                                        <FontAwesomeIcon icon={faProjectDiagram} className="m-0" />
                                        <span className="ms-2">Metadata-mediated correlation</span>
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey={Tabs.CORRELATED_ENRICHMENT}>
                                        <FontAwesomeIcon icon={faBullseye} className="m-0" />
                                        <span className="ms-2">Correlated Genes Enrichment</span>
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey={Tabs.NETME_TAB}>
                                        <FontAwesomeIcon icon={faBookReader} className="m-0" />
                                        <span className="ms-2">Literature Knowledge-graph</span>
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Card>
                    </Col>
                </Row>
            </Tab.Container>
        </>
    );
}
