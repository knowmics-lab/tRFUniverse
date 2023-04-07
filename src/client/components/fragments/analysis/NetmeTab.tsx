import React, { useCallback, useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import { useBasicReducer, useNotify } from "@/hooks";
import EnumSelect from "@/components/commons/EnumSelect";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookReader, faCog } from "@fortawesome/free-solid-svg-icons";
import logoPic from "@/public/assets/netme.png";
import Image from "next/image";

type NetmeTabProps = {
    fragment: string;
    synonyms: string[];
};
type AnalysisState = {
    searchType: "full-text" | "abstract";
    papersNumber: 10 | 20 | 50 | 100 | 500;
};

const NETME_URL = "https://api.netme.click/send_data";
const RESULT_URL = "https://netme.click/#/results";
const DEFAULT_STATE: AnalysisState = {
    searchType: "full-text",
    papersNumber: 10,
};

async function submitAnalysis(input: string, state: AnalysisState) {
    const request = await fetch(NETME_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            accept: "application/json",
        },
        body: JSON.stringify({
            searchOn: "terms",
            sortType: "relevance",
            queryMode: "pubmed",
            networkName: `Netme analysis of ${input}`,
            ...state,
            input,
        }),
    });
    if (!request.ok) {
        throw new Error("Network error");
    }
    const { query_id } = await request.json();
    if (!query_id) {
        throw new Error("Invalid response");
    }
    return `${RESULT_URL}/${query_id}`;
}

export default function Netme({ fragment, synonyms }: NetmeTabProps) {
    const notify = useNotify();
    const [isRunning, setIsRunning] = useState(false);
    const [state, dispatch] = useBasicReducer<AnalysisState>(DEFAULT_STATE);
    const runAnalysis = useCallback(async () => {
        try {
            setIsRunning(true);
            const inputQuery = `"${[
                fragment,
                ...synonyms.map((s) => s.split("::")[1].trim()).filter((s) => s !== ""),
            ].join('" OR "')}"`;
            const url = await submitAnalysis(inputQuery, {
                ...DEFAULT_STATE,
                ...state,
            });
            window.open(url, "_blank");
            setIsRunning(false);
        } catch (e) {
            notify({
                title: "Error",
                message: `${e}`,
                type: "danger",
            });
            setIsRunning(false);
        }
    }, [fragment, notify, state, synonyms]);
    return (
        <>
            <Card className="p-3 shadow-lg border-radius-xl bg-white">
                <Card.Body>
                    <Row className="gap-2 gap-md-0">
                        <Col
                            sm={12}
                            md={6}
                            className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2 d-flex flex-column justify-content-end"
                        >
                            <EnumSelect
                                options={[
                                    { value: "full-text", label: "Full-text Articles (less results)" },
                                    { value: "abstract", label: "Abstracts (more results)" },
                                ]}
                                state={state}
                                field="searchType"
                                dispatch={dispatch}
                                placeholder="Select a literature source"
                            />
                        </Col>
                        <Col
                            sm={12}
                            md={6}
                            className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2 d-flex flex-column justify-content-end"
                        >
                            <EnumSelect
                                options={[
                                    { value: 10, label: "10" },
                                    { value: 20, label: "20" },
                                    { value: 50, label: "50" },
                                    { value: 100, label: "100" },
                                    { value: 500, label: "500" },
                                ]}
                                state={state}
                                field="papersNumber"
                                dispatch={dispatch}
                                placeholder="Select the number of papers to use"
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col sm="auto" className="mx-auto my-4">
                            <button
                                className="btn btn-primary btn-lg"
                                disabled={isRunning}
                                onClick={(e) => {
                                    e.preventDefault();
                                    runAnalysis().catch(console.error);
                                }}
                            >
                                {!isRunning && <FontAwesomeIcon icon={faBookReader} className="me-2" />}
                                {isRunning && <FontAwesomeIcon icon={faCog} className="me-2 fa-spin" />}
                                {!isRunning && "Run analysis"}
                                {isRunning && "Submitting...Please wait..."}
                            </button>
                        </Col>
                    </Row>
                    <Row>
                        <Col sm="auto" className="mx-auto my-1 text-sm">
                            <div>Service powered by</div>
                            <div
                                style={{
                                    position: "relative",
                                    height: "5em",
                                }}
                            >
                                <Image src={logoPic} alt="NetME" layout="fill" objectFit="scale-down" />
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </>
    );
}
