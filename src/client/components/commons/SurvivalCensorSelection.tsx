import { Col, Form, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import { ChangeEventHandler, useCallback, useId, useMemo } from "react";

type StateType = {
    left_censoring?: number;
    right_censoring?: number;
};

type PropsType = {
    state: StateType;
    dispatch: (action: { type: keyof StateType; payload: any }) => void;
};

type FormControlElement = HTMLInputElement | HTMLTextAreaElement;

export default function SurvivalCensorSelection({ state, dispatch }: PropsType) {
    const leftCensoringId = useId();
    const rightCensoringId = useId();
    const onChange = useCallback(
        (type: keyof StateType): ChangeEventHandler<FormControlElement> =>
            (e) => {
                const value = e.target.value;
                dispatch({
                    type,
                    payload: value === "" ? undefined : value,
                });
            },
        [dispatch],
    );
    const onChangeLeftCensoring = useMemo(() => onChange("left_censoring"), [onChange]);
    const onChangeRightCensoring = useMemo(() => onChange("right_censoring"), [onChange]);
    return (
        <Row>
            <Col sm={6} className="mt-2">
                <OverlayTrigger
                    overlay={
                        <Tooltip id={`tooltip-${leftCensoringId}`}>
                            All samples with a survival time less than this value will be removed from the analysis. The
                            time is expressed in months.
                        </Tooltip>
                    }
                >
                    <Form.Label htmlFor={leftCensoringId}>Left censoring (months)</Form.Label>
                </OverlayTrigger>
                <Form.Control
                    id={leftCensoringId}
                    size="sm"
                    type="text"
                    placeholder="None"
                    value={state.left_censoring ?? ""}
                    onChange={onChangeLeftCensoring}
                />
            </Col>
            <Col sm={6} className="mt-2">
                <OverlayTrigger
                    overlay={
                        <Tooltip id={`tooltip-${leftCensoringId}`}>
                            All samples with a survival time greater than this value will be considered alive. The time
                            is expressed in months.
                        </Tooltip>
                    }
                >
                    <Form.Label htmlFor={rightCensoringId}>Right censoring (months)</Form.Label>
                </OverlayTrigger>
                <Form.Control
                    id={rightCensoringId}
                    size="sm"
                    type="text"
                    placeholder="None"
                    value={state.right_censoring ?? ""}
                    onChange={onChangeRightCensoring}
                />
            </Col>
        </Row>
    );
}
