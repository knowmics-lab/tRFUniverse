import { Col, Form, Row } from "react-bootstrap";
import { useId } from "react";

type StateType = {
    cutoff_type?: "median" | "quartile" | "custom";
    cutoff_high?: number;
    cutoff_low?: number;
};

type PropsType = {
    state: StateType;
    dispatch: (action: { type: keyof StateType; payload: any }) => void;
};

export default function SurvivalThresholdSelection({ state, dispatch }: PropsType) {
    const radioId = useId();
    const cutoffLowId = useId();
    const cutoffHighId = useId();
    return (
        <>
            <Row>
                <Col>
                    <Form.Label>Group Cutoff</Form.Label>
                    <div className="mb-3">
                        <Form.Check
                            inline
                            label="Median"
                            name="cutoff_type"
                            type="radio"
                            id={`${radioId}-median`}
                            checked={state.cutoff_type === "median"}
                            onChange={() => {
                                dispatch({ type: "cutoff_type", payload: "median" });
                                dispatch({ type: "cutoff_high", payload: 0.5 });
                                dispatch({ type: "cutoff_low", payload: 0.5 });
                            }}
                        />
                        <Form.Check
                            inline
                            label="Quartile"
                            name="cutoff_type"
                            type="radio"
                            id={`${radioId}-quartile`}
                            checked={state.cutoff_type === "quartile"}
                            onChange={() => {
                                dispatch({ type: "cutoff_type", payload: "quartile" });
                                dispatch({ type: "cutoff_high", payload: 0.75 });
                                dispatch({ type: "cutoff_low", payload: 0.25 });
                            }}
                        />
                        <Form.Check
                            inline
                            label="Custom"
                            name="cutoff_type"
                            type="radio"
                            id={`${radioId}-custom`}
                            checked={state.cutoff_type === "custom"}
                            onChange={() => dispatch({ type: "cutoff_type", payload: "custom" })}
                        />
                    </div>
                </Col>
            </Row>
            <Row className="mt-n2">
                <Col sm={6}>
                    <Form.Label htmlFor={cutoffHighId}>Cut-off High</Form.Label>
                    <Form.Control
                        id={cutoffHighId}
                        size="sm"
                        type="text"
                        placeholder="Cut-off High"
                        disabled={state.cutoff_type !== "custom"}
                        value={state.cutoff_high}
                        onChange={(e) => {
                            dispatch({
                                type: "cutoff_high",
                                payload: Number(e.target.value),
                            });
                        }}
                    />
                </Col>
                <Col sm={6}>
                    <Form.Label htmlFor={cutoffLowId}>Cut-off Low</Form.Label>
                    <Form.Control
                        id={cutoffLowId}
                        size="sm"
                        type="text"
                        placeholder="Cut-off Low"
                        disabled={state.cutoff_type !== "custom"}
                        value={state.cutoff_low}
                        onChange={(e) => {
                            dispatch({
                                type: "cutoff_low",
                                payload: Number(e.target.value),
                            });
                        }}
                    />
                </Col>
            </Row>
        </>
    );
}
