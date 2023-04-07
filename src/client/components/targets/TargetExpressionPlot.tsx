import { Card, Col, Row } from "react-bootstrap";
import { Target } from "@/types";
import { LocalPlotViewer } from "@/components/PlotViewer";
import type { Data } from "plotly.js";
import { useMemo } from "react";
import { formatP, formatPStars } from "@/formatters";

type TargetExpressionPlotProps = {
    target: Target;
};

export default function TargetExpressionPlot({ target }: TargetExpressionPlotProps) {
    const data = useMemo(
        () =>
            Object.entries(target.expressions)
                .sort(([d1], [d2]) => d1.localeCompare(d2))
                .map(([dataset, expression]) => ({
                    type: "bar",
                    name: dataset,
                    x: [dataset],
                    y: [expression.logFC],
                    text: [formatPStars(expression.p)],
                    textposition: "outside",
                    hovertemplate: `<b>Dataset</b>: ${dataset}<br><b>LogFC</b>: %{y:.4f}<br><b>p-value</b>: %{customdata}<extra></extra>`,
                    customdata: [formatP(expression.p)],
                })) as Data[],
        [target.expressions],
    );
    return (
        <>
            <Card className="mx-4 mt-4 p-3 shadow-lg border-radius-xl bg-white h-100">
                <Card.Header className="pb-0 p-3">
                    <div className="d-flex justify-content-between">
                        <h6 className="mb-2">Target expression</h6>
                    </div>
                </Card.Header>
                <Card.Body>
                    <Row className="my-4">
                        <Col sm="auto" className="mx-auto">
                            <LocalPlotViewer
                                data={{
                                    data: data,
                                    config: {},
                                    layout: {
                                        xaxis: {
                                            visible: false,
                                            showticklabels: false,
                                        },
                                    },
                                }}
                            />
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </>
    );
}
