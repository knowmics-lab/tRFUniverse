import { FragmentPosition } from "@/types";
import { Card, Col, Nav, Row, Tab } from "react-bootstrap";
import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import Browser from "@/components/browser";
import { formatInteger } from "@/formatters";

type TranscriptsTabProp = {
    transcripts: FragmentPosition[];
};

export default function TranscriptsTab({ transcripts }: TranscriptsTabProp) {
    const [key, setKey] = useState<number>(0);
    const currentTranscript = useMemo(() => transcripts[key], [key, transcripts]);
    return (
        <>
            <Tab.Container
                id="left-tabs-example"
                activeKey={`transcript-tab-${key}`}
                onSelect={(k) => setKey(Number(k?.replace("transcript-tab-", "")))}
            >
                <Row className="mx-4 mt-4 flex-column-reverse flex-md-row">
                    <Col md={9}>
                        <Card className="p-3 border-radius-xl bg-white h-100">
                            <Tab.Content>
                                <Tab.Pane key={`transcript-tab-pane-${key}`} eventKey={`transcript-tab-${key}`}>
                                    <dl className="row">
                                        <dt className="col-md-3">Chromosome:</dt>
                                        <dd className="col-md-9">{currentTranscript.chromosome}</dd>
                                        <dt className="col-md-3">Position:</dt>
                                        <dd className="col-md-9">
                                            {formatInteger(currentTranscript.start)} &ndash;{" "}
                                            {formatInteger(currentTranscript.end)}
                                        </dd>
                                        <dt className="col-md-3">Strand:</dt>
                                        <dd className="col-md-9">
                                            <FontAwesomeIcon
                                                icon={currentTranscript.strand === "+" ? faArrowRight : faArrowLeft}
                                            />
                                        </dd>
                                        <dt className="col-md-3">Anticodon:</dt>
                                        <dd className="col-md-9">{currentTranscript.anticodon}</dd>
                                        <dt className="col-md-3">Aminoacid:</dt>
                                        <dd className="col-md-9">{currentTranscript.aminoacid}</dd>
                                    </dl>
                                    <Browser position={currentTranscript} />
                                </Tab.Pane>
                            </Tab.Content>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="shadow-lg border-radius-xl bg-white h-100">
                            <Nav variant="pills" className="flex-column header-tab h-100">
                                {transcripts.map((pos, idx) => (
                                    <Nav.Item key={`transcript-tab-header-${pos.id}`}>
                                        <Nav.Link eventKey={`transcript-tab-${idx}`}>
                                            {`${pos.chromosome}:${formatInteger(pos.start)}-${formatInteger(pos.end)}`}
                                        </Nav.Link>
                                    </Nav.Item>
                                ))}
                            </Nav>
                        </Card>
                    </Col>
                </Row>
            </Tab.Container>
        </>
    );
}
