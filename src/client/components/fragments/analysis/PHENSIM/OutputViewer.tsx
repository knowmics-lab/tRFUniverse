import { PHENSIMCompletedResult, PHENSIMResultType } from "@/types";
import React, { Ref } from "react";
import { useScrollingEffect } from "@/hooks";
import { useToggle } from "@/hooks/commons";
import { Card, Collapse } from "react-bootstrap";
import ShowPHENSIMLog from "@/components/fragments/analysis/PHENSIM/ShowPHENSIMLog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronRight, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import PathwayListTable from "@/components/fragments/analysis/PHENSIM/PathwayListTable";
import PathwayTable from "@/components/fragments/analysis/PHENSIM/PathwayTable";
import TargetsTable from "@/components/fragments/analysis/PHENSIM/TargetsTable";

type ResultsViewProps = {
    results?: PHENSIMResultType;
    analysisId?: string;
};

function isCompleted(results?: PHENSIMResultType): results is PHENSIMCompletedResult {
    return !!results && results.status === "completed";
}

export default function OutputViewer({ results, analysisId }: ResultsViewProps) {
    const completedAnalysis = isCompleted(results);
    const failedAnalysis = results && results.status === "failed";
    const otherAnalysisStates = !completedAnalysis && !failedAnalysis;
    const [selectedPathway, setSelectedPathway] = React.useState<string | undefined>();
    const resultsTableCardRef = useScrollingEffect(results);
    const pathwayDetailsTableRef = useScrollingEffect(selectedPathway);
    const [isInputOpen, toggleInput] = useToggle();
    const [isPathwayDetailsOpen, togglePathwayDetails] = useToggle();

    if (!results) return null;
    return (
        <>
            <Card className="p-3 my-4 shadow-lg border-radius-xl bg-white">
                <Card.Header className="pb-0 p-3">
                    <div className="d-flex justify-content-between" ref={resultsTableCardRef as Ref<HTMLDivElement>}>
                        <h6 className="mb-2">
                            {completedAnalysis && "PHENSIM Analysis results"}
                            {otherAnalysisStates && "PHENSIM Analysis"}
                        </h6>
                    </div>
                </Card.Header>
                <Card.Body>
                    {otherAnalysisStates && <ShowPHENSIMLog analysisId={analysisId} />}
                    {failedAnalysis && (
                        <>
                            <h5 className="text-danger text-center mb-2">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                                <span>Analysis failed</span>
                            </h5>
                            <div className="text-danger">
                                <pre>{results.logs}</pre>
                            </div>
                        </>
                    )}
                    {completedAnalysis && (
                        <PathwayListTable
                            results={results}
                            onSelectPathway={(pathwayId) => {
                                setSelectedPathway(pathwayId);
                                togglePathwayDetails(true);
                            }}
                        />
                    )}
                </Card.Body>
            </Card>
            {completedAnalysis && selectedPathway && (
                <Card className="p-3 my-4 shadow-lg border-radius-xl bg-white">
                    <Card.Header className="pb-0 p-3">
                        <div
                            className="d-flex justify-content-between"
                            ref={pathwayDetailsTableRef as Ref<HTMLDivElement>}
                        >
                            <h6 className="mb-2">
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        togglePathwayDetails();
                                    }}
                                    title={isPathwayDetailsOpen ? "Click to close" : "Click to open"}
                                >
                                    <span className="d-flex justify-content-between gap-4">
                                        <span>
                                            <FontAwesomeIcon
                                                icon={isPathwayDetailsOpen ? faChevronDown : faChevronRight}
                                                fixedWidth
                                            />
                                        </span>
                                        <span>Pathway Details</span>
                                    </span>
                                </a>
                            </h6>
                        </div>
                    </Card.Header>
                    <Collapse in={isPathwayDetailsOpen}>
                        <Card.Body>
                            <PathwayTable results={results} pathwayId={selectedPathway} />
                        </Card.Body>
                    </Collapse>
                </Card>
            )}
            {completedAnalysis && (
                <Card className="p-3 my-4 shadow-lg border-radius-xl bg-white">
                    <Card.Header className="pb-0 p-3">
                        <div className="d-flex justify-content-between">
                            <h6 className="mb-2">
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        toggleInput();
                                    }}
                                    title={isInputOpen ? "Click to close" : "Click to open"}
                                >
                                    <span className="d-flex justify-content-between gap-4">
                                        <span>
                                            <FontAwesomeIcon
                                                icon={isInputOpen ? faChevronDown : faChevronRight}
                                                fixedWidth
                                            />
                                        </span>
                                        <span>Simulation Input</span>
                                    </span>
                                </a>
                            </h6>
                        </div>
                    </Card.Header>
                    <Collapse in={isInputOpen}>
                        <Card.Body>
                            <TargetsTable results={results} />
                        </Card.Body>
                    </Collapse>
                </Card>
            )}
        </>
    );
}
