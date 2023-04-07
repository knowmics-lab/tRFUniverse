import { Card, Col, Form, Row } from "react-bootstrap";
import { useId, useMemo, useReducer } from "react";
import { useAtom } from "jotai";
import { aminoacidsAtom, anticodonsAtom, chromosomesAtom, fragmentTypesAtom, metadataAtom } from "@/atoms";
import Select from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faPlus, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { Metadata, Option } from "@/types";
import { AdvancedSearchFilterType, AdvancedSearchRequest, QueryRequest } from "@/types/requests";

type StateType = Omit<AdvancedSearchRequest, keyof QueryRequest>;

type ActionType =
    | { type: keyof StateType; payload: any }
    | { type: "add_filter" }
    | { type: "remove_filter"; payload: number }
    | { type: "change_filter"; payload: { index: number; filter: Partial<AdvancedSearchFilterType> } };

type AdvancedSearchFormProps = {
    onSubmit: (request: StateType) => void;
};

const DEFAULT_MAPPER = ({ name }: { name: string }) => ({ value: name, label: name === "NA" ? "Unknown" : name });

function reducer(state: Partial<StateType>, action: ActionType) {
    if (action.type === "add_filter") {
        return {
            ...state,
            filters: [...(state.filters ?? []), { field: "", value: "" }],
        };
    }
    if (action.type === "remove_filter") {
        return {
            ...state,
            filters: state.filters?.filter((_, i) => i !== action.payload),
        };
    }
    if (action.type === "change_filter") {
        return {
            ...state,
            filters: state.filters?.map((f, i) =>
                i === action.payload.index ? { ...f, ...action.payload.filter } : f,
            ),
        };
    }
    return { ...state, [action.type]: action.payload };
}

function useRemoteData() {
    const [rawFragmentTypes] = useAtom(fragmentTypesAtom);
    const [rawChromosomes] = useAtom(chromosomesAtom);
    const [rawAnticodons] = useAtom(anticodonsAtom);
    const [rawAminoacids] = useAtom(aminoacidsAtom);
    const [rawMetadata] = useAtom(metadataAtom);
    const fragmentTypes = useMemo(() => rawFragmentTypes.map(DEFAULT_MAPPER), [rawFragmentTypes]);
    const chromosomes = useMemo(
        () =>
            rawChromosomes
                .map(({ name }) => ({
                    value: name,
                    label: name.replace(/^chr/, "Chromosome "),
                    number: Number(name.replace(/^chr/, "")),
                }))
                .sort((a, b) => a.number - b.number)
                .map(({ value, label }) => ({ value, label })),
        [rawChromosomes],
    );
    const anticodons = useMemo(() => rawAnticodons.map(DEFAULT_MAPPER), [rawAnticodons]);
    const aminoacids = useMemo(() => rawAminoacids.map(DEFAULT_MAPPER), [rawAminoacids]);
    const metadata = useMemo(() => rawMetadata.filter(({ capabilities: { search } }) => search), [rawMetadata]);
    return { fragmentTypes, chromosomes, anticodons, aminoacids, metadata };
}

function useDataset(state: StateType, metadata: Metadata[]) {
    const dataset = useMemo(() => state.filters?.find((f) => f.field === "dataset")?.value, [state]);
    const filteredMetadata = useMemo(
        () =>
            metadata
                .map((m) => ({
                    name: m.name,
                    values: Object.entries(
                        !dataset || m.capabilities.dataset ? m.values : m.values_by_dataset[dataset] ?? {},
                    ),
                }))
                .map((m) => ({
                    name: m.name,
                    values: m.values.map(([value, label]) => ({ value, label })),
                }))
                .filter((m) => m.values.length > 1)
                .reduce((o, m) => ({ ...o, [m.name]: m.values }), {} as Record<string, Option[]>),
        [metadata, dataset],
    );
    const metadataOptions = useMemo(
        () =>
            metadata
                .filter((m) => typeof filteredMetadata[m.name] !== "undefined")
                .map(({ name, display_name }) => ({
                    value: name,
                    label: display_name,
                })),
        [metadata, filteredMetadata],
    );
    return { dataset, filteredMetadata, metadataOptions };
}

export default function AdvancedSearchForm({ onSubmit }: AdvancedSearchFormProps) {
    const minRpmId = useId();
    const { fragmentTypes, chromosomes, anticodons, aminoacids, metadata } = useRemoteData();
    const [state, dispatch] = useReducer(reducer, { min_rpm: 1 });
    const { filteredMetadata, metadataOptions } = useDataset(state, metadata);

    return (
        <Card className="border-radius-xl bg-white mt-md-7">
            <Card.Header className="pb-0 p-3">
                <div className="d-flex justify-content-between">
                    <h6 className="mb-2">Advanced Search</h6>
                </div>
            </Card.Header>
            <Card.Body>
                <Row className="gap-2 gap-md-0">
                    <Col sm={12} md={6} xl={3} className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2">
                        <Select<Option>
                            placeholder="Fragment type"
                            isClearable
                            options={fragmentTypes}
                            value={fragmentTypes.find(({ value }) => value === state.fragment_type)}
                            onChange={(option) => dispatch({ type: "fragment_type", payload: option?.value })}
                        />
                    </Col>
                    <Col sm={12} md={6} xl={3} className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2">
                        <Select<Option>
                            placeholder="Chromosome"
                            isClearable
                            options={chromosomes}
                            value={chromosomes.find(({ value }) => value === state.chromosome)}
                            onChange={(option) => dispatch({ type: "chromosome", payload: option?.value })}
                        />
                    </Col>
                    <Col sm={12} md={6} xl={3} className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2">
                        <Select<Option>
                            placeholder="Anticodon"
                            isClearable
                            options={anticodons}
                            value={anticodons.find(({ value }) => value === state.anticodon)}
                            onChange={(option) => dispatch({ type: "anticodon", payload: option?.value })}
                        />
                    </Col>
                    <Col sm={12} md={6} xl={3} className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2">
                        <Select<Option>
                            placeholder="Aminoacid"
                            isClearable
                            options={aminoacids}
                            value={aminoacids.find(({ value }) => value === state.aminoacid)}
                            onChange={(option) => dispatch({ type: "aminoacid", payload: option?.value })}
                        />
                    </Col>
                </Row>
                <Row className="my-4">
                    <Col sm="12" className="mx-auto">
                        <Form.Label htmlFor={minRpmId}>Minimum RPM expression</Form.Label>
                        <Form.Control
                            type="text"
                            id={minRpmId}
                            value={state.min_rpm}
                            onChange={(e) => dispatch({ type: "min_rpm", payload: Number(e.target.value) })}
                        />
                    </Col>
                </Row>
                <Row className="my-4">
                    <Col sm="12" className="mx-auto">
                        <h6 className="mb-0">
                            <div className="d-flex flex-row">
                                <div className="flex-grow-1">Metadata filters</div>
                                <div className="flex-grow-0">
                                    <a
                                        className="btn btn-link text-success text-gradient px-3 mb-0"
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            dispatch({ type: "add_filter" });
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                                        Add
                                    </a>
                                </div>
                            </div>
                        </h6>
                        <div className="pt-4 p-3">
                            <ul className="list-group">
                                {state.filters &&
                                    state.filters.map((filter, index) => (
                                        <li
                                            key={`filter-${index}`}
                                            className="list-group-item border-0 d-flex p-4 mb-2 bg-gray-100 border-radius-lg"
                                        >
                                            <div className="d-flex flex-row gap-2 flex-grow-1">
                                                <Row className="w-100">
                                                    <Col sm={6}>
                                                        <Select<Option>
                                                            placeholder="Filter field"
                                                            isClearable
                                                            options={metadataOptions}
                                                            value={metadataOptions.find(
                                                                ({ value }) => value === state?.filters?.[index]?.field,
                                                            )}
                                                            onChange={(option) =>
                                                                dispatch({
                                                                    type: "change_filter",
                                                                    payload: {
                                                                        index,
                                                                        filter: {
                                                                            field: option?.value,
                                                                        },
                                                                    },
                                                                })
                                                            }
                                                        />
                                                    </Col>
                                                    <Col sm={6}>
                                                        {!!state?.filters?.[index]?.field && (
                                                            <Select<Option>
                                                                placeholder="Value"
                                                                isClearable
                                                                options={filteredMetadata[state.filters[index].field]}
                                                                value={filteredMetadata[
                                                                    state.filters[index].field
                                                                ].find(
                                                                    ({ value }) =>
                                                                        value === state?.filters?.[index]?.value,
                                                                )}
                                                                onChange={(option) =>
                                                                    dispatch({
                                                                        type: "change_filter",
                                                                        payload: {
                                                                            index,
                                                                            filter: {
                                                                                value: option?.value,
                                                                            },
                                                                        },
                                                                    })
                                                                }
                                                            />
                                                        )}
                                                    </Col>
                                                </Row>
                                            </div>
                                            <div className="ms-auto text-end">
                                                <a
                                                    className="btn btn-link text-danger text-gradient px-3 mb-0"
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        dispatch({ type: "remove_filter", payload: index });
                                                    }}
                                                >
                                                    <FontAwesomeIcon icon={faTrashAlt} className="me-2" />
                                                    Delete
                                                </a>
                                            </div>
                                        </li>
                                    ))}
                                {!state.filters ||
                                    (state.filters.length === 0 && (
                                        <li className="list-group-item border-0 d-flex p-4 mb-2 bg-gray-100 border-radius-lg">
                                            <div className="d-flex flex-column">
                                                <h6 className="mb-0 text-sm">
                                                    Samples will not be filtered by metadata. Click the &quot;Add&quot;
                                                    button if you wish to add a filter.
                                                </h6>
                                            </div>
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    </Col>
                </Row>
                <Row className="my-4">
                    <Col sm="auto" className="mx-auto">
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={(e) => {
                                e.preventDefault();
                                onSubmit(state);
                            }}
                        >
                            <FontAwesomeIcon icon={faMagnifyingGlass} className="me-2" />
                            Search
                        </button>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
}
