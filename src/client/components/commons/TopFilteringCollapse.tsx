import { Col, Collapse, Form, Row } from "react-bootstrap";
import Select from "react-select";
import { Option } from "@/types";
import { FILTERING_FUNCTION_OPTIONS, FilteringFunctionEnum } from "@/constants";
import { RequestWithTopNFiltering } from "@/types/requests";
import React, { useId } from "react";

export type TopFilteringCollapseProps<T extends RequestWithTopNFiltering> = {
    state: T;
    dispatch: (action: { type: keyof T; payload: any }) => void;
};

export function FilteringSwitch<T extends RequestWithTopNFiltering>({ state, dispatch }: TopFilteringCollapseProps<T>) {
    const checkFilteringId = useId();
    return (
        <Form.Check
            type="switch"
            id={checkFilteringId}
            label="Enable fragments filtering?"
            checked={state.filtering ?? false}
            onChange={(e) => dispatch({ type: "filtering", payload: e.target.checked })}
        />
    );
}

export default function TopFilteringCollapse<T extends RequestWithTopNFiltering>({
    state,
    dispatch,
}: TopFilteringCollapseProps<T>) {
    const topNId = useId();
    const selectId = useId();
    return (
        <Collapse in={state.filtering ?? false}>
            <div>
                <Row className="my-4 d-flex justify-content-center">
                    <Col sm={12} md={6} className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2">
                        <Form.Label htmlFor={topNId}>Keep the top-N fragments by filtering measure</Form.Label>
                        <Form.Control
                            id={topNId}
                            type="number"
                            placeholder="top-N"
                            value={state.filtering_top ?? 100}
                            onChange={(e) =>
                                dispatch({
                                    type: "filtering_top",
                                    payload: Number(e.target.value),
                                })
                            }
                        />
                    </Col>
                    <Col sm={12} md={6} className="flex-grow-1 flex-md-grow-0 mt-2 mt-md-2">
                        <Form.Label htmlFor={`react-select-${selectId}-input`}>
                            Select the type of expression values
                        </Form.Label>
                        <Select<Option<FilteringFunctionEnum>>
                            instanceId={selectId}
                            options={FILTERING_FUNCTION_OPTIONS}
                            value={FILTERING_FUNCTION_OPTIONS.find((e) => e.value === state.filtering_measure)}
                            onChange={(m) => dispatch({ type: "filtering_measure", payload: m?.value })}
                        />
                    </Col>
                </Row>
            </div>
        </Collapse>
    );
}
