import { Card } from "react-bootstrap";
import { BindingSite, BindingSiteSource } from "@/types";
import { ForwardedRef, forwardRef } from "react";
import ArrayDataTable from "@/components/ArrayDataTable";
import { predictedBindingSite } from "@/utils";
import { Alignment } from "@/components/DataTable";
import { formatInteger, formatNumber } from "@/formatters";

type BindingSiteCardProps = {
    bindingSite?: BindingSite;
};

function BindingSiteCard({ bindingSite }: BindingSiteCardProps, ref: ForwardedRef<HTMLDivElement>) {
    return (
        <>
            <Card className="mx-4 mt-4 p-3 shadow-lg border-radius-xl bg-white h-100">
                <Card.Header className="pb-0 p-3">
                    <div className="d-flex justify-content-between" ref={ref}>
                        <h6 className="mb-2">
                            {bindingSite
                                ? `Binding site ${bindingSite.transcript_name}:${formatInteger(
                                      bindingSite.start,
                                  )}-${formatInteger(bindingSite.end)}`
                                : "Select a binding site to display its details"}
                        </h6>
                    </div>
                </Card.Header>
                {!!bindingSite && (
                    <Card.Body>
                        <ArrayDataTable<BindingSiteSource>
                            data={bindingSite.sources}
                            columns={[
                                {
                                    id: "dataset",
                                    header: "Dataset",
                                    footer: "Dataset",
                                    cell: (info) => (
                                        <>
                                            <a
                                                href={`https://www.ncbi.nlm.nih.gov/bioproject/${info.row.original.dataset}`}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                {info.row.original.dataset}
                                            </a>
                                            {" ("}
                                            <a
                                                href={`https://trace.ncbi.nlm.nih.gov/Traces?run=${info.row.original.sample}`}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                {info.row.original.sample}
                                            </a>
                                            {")"}
                                        </>
                                    ),
                                },
                                {
                                    accessorKey: "algorithm",
                                    header: "Algorithm",
                                    footer: "Algorithm",
                                    enableColumnFilter: false,
                                },
                                {
                                    id: "predictedBindingSite",
                                    header: "Sequence",
                                    footer: "Sequence",
                                    cell: (info) => (
                                        <pre className="text-monospace">
                                            {predictedBindingSite(
                                                info.row.original.fragment_sequence,
                                                info.row.original.target_sequence,
                                            )}
                                        </pre>
                                    ),
                                },
                                {
                                    accessorKey: "mfe",
                                    header: "MFE",
                                    footer: "MFE",
                                    enableColumnFilter: false,
                                    cell: (info) => formatNumber(info.getValue() as number),
                                },
                            ]}
                            columnsSizing={{
                                dataset: "15%",
                                algorithm: "10%",
                                read_count: "10%",
                                mfe: "10%",
                            }}
                            columnsAlignment={{
                                read_count: Alignment.CENTER,
                                mfe: Alignment.CENTER,
                            }}
                            expandable
                            renderExpandedRow={(info) => (
                                <pre className="text-monospace">{info.row.original.fragment_sequence}</pre>
                            )}
                        />
                    </Card.Body>
                )}
            </Card>
        </>
    );
}

export default forwardRef(BindingSiteCard);
