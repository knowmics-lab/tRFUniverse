import { Card, Col, Collapse, Form, Row } from "react-bootstrap";
import React, { Dispatch, Suspense, useCallback, useId, useMemo, useReducer, useState } from "react";
import Select from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { differentialExpressionFetcher, differentialExpressionMetadataFetcher } from "@/fetchers";
import useRemoteAnalysis from "@/hooks/useRemoteAnalysis";
import { DifferentiallyExpressedResponse, Option } from "@/types";
import { Contrast, DifferentialExpressionAnalysisRequest as RequestType } from "@/types/requests";
import { useMetadataByDataset, useMetadataWithDataset, useScrollingEffect } from "@/hooks";
import { useToggle } from "@/hooks/commons";
import Loading from "@/components/Loading";
import useSWR from "swr";
import RemoteView from "@/components/RemoteView";
import CovariatesSelect from "@/components/commons/CovariatesSelect";
import MetadataSelect from "@/components/commons/MetadataSelect";
import DatasetSelect from "@/components/commons/DatasetSelect";
import SubmitButton from "@/components/commons/SubmitButton";
import ShareThisPage from "@/components/commons/ShareThisPage";

type ActionType =
    | { type: keyof RequestType; payload: any }
    | { type: "add_contrast" }
    | { type: "remove_contrast"; payload: number }
    | { type: "change_contrast"; payload: { index: number; filter: Partial<Contrast> } }
    | { type: "restore"; payload: Partial<RequestType> };

type ContrastFormProps = {
    contrast: Contrast;
    index: number;
    dispatch: Dispatch<ActionType>;
    metadataOptions: Option[];
};

type ContrastsContainerProps = {
    dataset?: string;
    state: Partial<RequestType>;
    dispatch: Dispatch<ActionType>;
};

function reducer(state: Partial<RequestType>, action: ActionType) {
    if (action.type === "restore") {
        return { ...state, ...action.payload };
    }
    if (action.type === "add_contrast") {
        return {
            ...state,
            contrasts: [...(state.contrasts ?? []), { case: [], control: [] }],
        };
    }
    if (action.type === "remove_contrast") {
        return {
            ...state,
            contrasts: state.contrasts?.filter((_, i) => i !== action.payload),
        };
    }
    if (action.type === "change_contrast") {
        return {
            ...state,
            contrasts: state.contrasts?.map((f, i) =>
                i === action.payload.index ? { ...f, ...action.payload.filter } : f,
            ),
        };
    }
    return { ...state, [action.type]: action.payload };
}

function checkContrasts(state: Partial<RequestType>) {
    if (!state.contrasts) return false;
    return state.contrasts.some((contrast) => contrast.case.length > 0 && contrast.control.length > 0);
}

function ContrastForm({ contrast, index, dispatch, metadataOptions }: ContrastFormProps) {
    return (
        <Row className="border-bottom-lg border-dark py-2 align-items-center">
            <Col xs="11">
                <Row>
                    <Col xs={6}>
                        <Select<Option, true>
                            placeholder="Select case classes"
                            isClearable
                            isMulti
                            options={metadataOptions}
                            value={metadataOptions.filter((m) => contrast.case.includes(m.value))}
                            onChange={(m) =>
                                dispatch({
                                    type: "change_contrast",
                                    payload: {
                                        index,
                                        filter: { case: m?.map((m) => m.value) },
                                    },
                                })
                            }
                        />
                    </Col>
                    <Col xs={6}>
                        <Select<Option, true>
                            placeholder="Select control classes"
                            isClearable
                            isMulti
                            options={metadataOptions}
                            value={metadataOptions.filter((m) => contrast.control.includes(m.value))}
                            onChange={(m) =>
                                dispatch({
                                    type: "change_contrast",
                                    payload: {
                                        index,
                                        filter: { control: m?.map((m) => m.value) },
                                    },
                                })
                            }
                        />
                    </Col>
                </Row>
            </Col>
            <Col xs={1} className="d-flex align-items-center justify-content-center">
                <a
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        dispatch({ type: "remove_contrast", payload: index });
                    }}
                >
                    <FontAwesomeIcon icon={faTrash} />
                </a>
            </Col>
        </Row>
    );
}

function ContrastsContainer({ dataset, state, dispatch }: ContrastsContainerProps) {
    const query = useMemo(() => {
        if (!dataset || !state.metadata || !state.metadata.length) return undefined;
        return { dataset, metadata: state.metadata };
    }, [dataset, state.metadata]);
    const { data } = useSWR(query, differentialExpressionMetadataFetcher, { suspense: true });
    const metadataOptions = useMemo(() => {
        if (!data) return [];
        return data.data;
    }, [data]);
    return (
        <>
            <div className="border-bottom-lg border-dark d-flex align-items-center justify-content-between">
                <div>
                    <h5>Contrasts</h5>
                </div>
                <div>
                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            if (metadataOptions.length > 0) dispatch({ type: "add_contrast" });
                        }}
                    >
                        <FontAwesomeIcon icon={faPlus} />
                    </a>
                </div>
            </div>
            <div>
                {!state?.contrasts?.length && (
                    <div className="text-center my-4">
                        <p>No contrasts defined</p>
                    </div>
                )}
                {state?.contrasts?.map((contrast, i) => (
                    <ContrastForm
                        key={`contrast-form-${i}`}
                        contrast={contrast}
                        index={i}
                        dispatch={dispatch}
                        metadataOptions={metadataOptions}
                    />
                ))}
            </div>
        </>
    );
}

export default function DifferentialExpression() {
    const logFCCutoffFieldId = useId();
    const qValueCutoffFieldId = useId();
    const minCountCutoffFieldId = useId();
    const minTotalCountCutoffFieldId = useId();
    const minPropFieldId = useId();
    const [advancedOpen, toggleAdvanced] = useToggle();
    const [selectedContrast, setSelectedContrast] = useState("");
    const { dataset, setDataset, allDatasets, metadataByDataset, covariatesMetadata } = useMetadataWithDataset("degs");
    const filteredMetadata = useMetadataByDataset(metadataByDataset, "degs");
    const [state, dispatch] = useReducer(reducer, {
        logfc_cutoff: 0.6,
        qvalue_cutoff: 0.05,
        min_count_cutoff: 5,
        min_total_count_cutoff: 15,
        min_prop: 0.7,
    });
    const onRestore = useCallback(
        ({ dataset, ...params }: RequestType) => {
            setDataset(dataset);
            dispatch({ type: "restore", payload: params });
        },
        [dispatch, setDataset],
    );
    const degsAnalysis = useRemoteAnalysis<RequestType, DifferentiallyExpressedResponse[]>(
        differentialExpressionFetcher,
        "",
        true,
        "Your differential expression analysis has been completed!",
        onRestore,
    );
    const submitDisabled = useMemo(() => !dataset || !state.metadata || !checkContrasts(state), [dataset, state]);
    const degsCardRef = useScrollingEffect<HTMLDivElement>(degsAnalysis.results);
    const contrastCardRef = useScrollingEffect<HTMLDivElement>(
        useMemo(() => degsAnalysis.results && selectedContrast, [degsAnalysis.results, selectedContrast]),
    );
    return (
        <>
            <Card className="m-4 p-3 shadow-lg border-radius-xl bg-white">
                <Card.Body>
                    <Row className="gap-2 gap-md-0 align-items-center">
                        <Col sm={12} md={4} className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2">
                            <DatasetSelect
                                datasets={allDatasets}
                                isMulti={false}
                                selection={dataset}
                                dispatch={setDataset}
                            />
                        </Col>
                        <Col sm={12} md={4} className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2">
                            <MetadataSelect
                                placeholder="Select metadata"
                                metadata={filteredMetadata}
                                isMulti={true}
                                dispatch={dispatch}
                                selection={state.metadata}
                            />
                        </Col>
                        <Col sm={12} md={4} className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2">
                            <CovariatesSelect
                                covariatesMetadata={covariatesMetadata}
                                selectedCovariates={state.covariates}
                                dispatch={dispatch}
                            />
                        </Col>
                    </Row>
                    <Row className="my-4">
                        <Col xs={12}>
                            <a
                                href="#"
                                className="border-bottom-lg border-dark d-flex align-items-center justify-content-between"
                                onClick={(e) => {
                                    e.preventDefault();
                                    toggleAdvanced();
                                }}
                            >
                                <div>
                                    <h5>Advanced options</h5>
                                </div>
                                <div>
                                    <FontAwesomeIcon icon={advancedOpen ? faChevronUp : faChevronDown} />
                                </div>
                            </a>
                            <Collapse in={advancedOpen}>
                                <div>
                                    <Row>
                                        <Col sm={6}>
                                            <Form.Label htmlFor={logFCCutoffFieldId}>LogFC Cutoff</Form.Label>
                                            <Form.Control
                                                id={logFCCutoffFieldId}
                                                size="sm"
                                                type="text"
                                                placeholder="LogFC Cutoff"
                                                value={state.logfc_cutoff}
                                                onChange={(e) => {
                                                    dispatch({
                                                        type: "logfc_cutoff",
                                                        payload: Number(e.target.value),
                                                    });
                                                }}
                                            />
                                        </Col>
                                        <Col sm={6}>
                                            <Form.Label htmlFor={qValueCutoffFieldId}>q-value Cutoff</Form.Label>
                                            <Form.Control
                                                id={qValueCutoffFieldId}
                                                size="sm"
                                                type="text"
                                                placeholder="q-value Cutoff"
                                                value={state.qvalue_cutoff}
                                                onChange={(e) => {
                                                    dispatch({
                                                        type: "qvalue_cutoff",
                                                        payload: Number(e.target.value),
                                                    });
                                                }}
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col sm={6} md={4}>
                                            <Form.Label htmlFor={minTotalCountCutoffFieldId}>
                                                Minimum total count
                                            </Form.Label>
                                            <Form.Control
                                                id={minTotalCountCutoffFieldId}
                                                size="sm"
                                                type="number"
                                                placeholder="Minimum total count"
                                                value={state.min_total_count_cutoff}
                                                onChange={(e) => {
                                                    dispatch({
                                                        type: "min_total_count_cutoff",
                                                        payload: Number(e.target.value),
                                                    });
                                                }}
                                            />
                                        </Col>
                                        <Col sm={6} md={4}>
                                            <Form.Label htmlFor={minCountCutoffFieldId}>
                                                Minimum count required for some samples
                                            </Form.Label>
                                            <Form.Control
                                                id={minCountCutoffFieldId}
                                                size="sm"
                                                type="number"
                                                placeholder="Minimum count required for some samples"
                                                value={state.min_count_cutoff}
                                                onChange={(e) => {
                                                    dispatch({
                                                        type: "min_count_cutoff",
                                                        payload: Number(e.target.value),
                                                    });
                                                }}
                                            />
                                        </Col>
                                        <Col sm={6} md={4}>
                                            <Form.Label htmlFor={minPropFieldId}>
                                                Minimum proportion of samples
                                            </Form.Label>
                                            <Form.Control
                                                id={minPropFieldId}
                                                size="sm"
                                                type="text"
                                                placeholder="Minimum proportion"
                                                value={state.min_prop}
                                                onChange={(e) => {
                                                    dispatch({
                                                        type: "min_prop",
                                                        payload: Number(e.target.value),
                                                    });
                                                }}
                                            />
                                        </Col>
                                    </Row>
                                </div>
                            </Collapse>
                        </Col>
                    </Row>
                    <Row className="my-4">
                        <Col xs={12}>
                            <Suspense fallback={<Loading />}>
                                <ContrastsContainer dataset={dataset} state={state} dispatch={dispatch} />
                            </Suspense>
                        </Col>
                    </Row>
                    <Row className="my-4">
                        <Col sm="auto" className="mx-auto">
                            <SubmitButton
                                monitoredAnalysis={degsAnalysis}
                                disabled={submitDisabled}
                                onClick={(e) => {
                                    e.preventDefault();
                                    degsAnalysis.runAnalysis({
                                        ...state,
                                        dataset,
                                        metadata: state.metadata ?? [],
                                        contrasts: state.contrasts ?? [],
                                    });
                                }}
                            />
                        </Col>
                    </Row>
                    <ShareThisPage />
                </Card.Body>
            </Card>
            {degsAnalysis.results && (
                <Card className="p-3 m-4 shadow-lg border-radius-xl bg-white">
                    <Card.Header className="pb-0 p-3">
                        <div className="d-flex justify-content-between" ref={degsCardRef}>
                            <h6 className="mb-2">Select a contrast</h6>
                        </div>
                    </Card.Header>
                    <Card.Body>
                        <div className="d-flex align-items-center justify-content-center">
                            <Select<DifferentiallyExpressedResponse>
                                className="flex-grow-1"
                                placeholder="Select a contrast"
                                isClearable
                                options={degsAnalysis.results}
                                getOptionLabel={(option) => option.contrasts.replace(/_/g, " ")}
                                getOptionValue={(option) => option.contrasts}
                                value={degsAnalysis.results.find((d) => d.contrasts === selectedContrast)}
                                onChange={(v) => setSelectedContrast(v?.contrasts ?? "")}
                            />
                        </div>
                    </Card.Body>
                </Card>
            )}
            {degsAnalysis.results && selectedContrast && (
                <Card className="m-4 shadow-lg border-radius-xl bg-white">
                    <Card.Header className="pb-0 p-3">
                        <div className="d-flex justify-content-between" ref={contrastCardRef}>
                            <h6 className="mb-2">Contrast Viewer</h6>
                        </div>
                    </Card.Header>
                    <Card.Body
                        className="d-flex flex-column"
                        style={{
                            minHeight: "50vmax",
                        }}
                    >
                        <RemoteView
                            url={degsAnalysis.results.find((d) => d.contrasts === selectedContrast)?.url ?? ""}
                        />
                    </Card.Body>
                </Card>
            )}
        </>
    );
}
