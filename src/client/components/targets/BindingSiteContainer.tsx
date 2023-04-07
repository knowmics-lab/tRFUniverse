import { BindingSite, BindingSiteSource } from "@/types";
import ArrayDataTable from "@/components/ArrayDataTable";
import { predictedBindingSite } from "@/utils";
import { Alignment } from "@/components/DataTable";
import { formatNumber } from "@/formatters";

type BindingSiteContainerProps = {
    bindingSite: BindingSite;
};

export default function BindingSiteContainer({ bindingSite }: BindingSiteContainerProps) {
    return (
        <>
            <div className="p-3">
                <div className="d-flex justify-content-between">
                    <h6 className="mb-2">Evidences</h6>
                </div>
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
                            accessorKey: "type",
                            header: "Type",
                            footer: "Type",
                            enableColumnFilter: false,
                        },
                        {
                            accessorKey: "ago",
                            header: "AGO",
                            footer: "AGO",
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
                        type: "10%",
                        ago: "10%",
                        mfe: "10%",
                    }}
                    columnsAlignment={{
                        type: Alignment.CENTER,
                        ago: Alignment.CENTER,
                        mfe: Alignment.CENTER,
                    }}
                    expandable
                    renderExpandedRow={({ row: { original } }) => (
                        <>
                            <p className="mx-4">
                                <strong>Source Project:</strong>{" "}
                                <a
                                    href={`https://www.ncbi.nlm.nih.gov/bioproject/${original.dataset}`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {original.dataset}
                                </a>
                                <br />
                                <strong>Sample:</strong>{" "}
                                <a
                                    href={`https://trace.ncbi.nlm.nih.gov/Traces?run=${original.sample}`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {original.sample}
                                </a>
                                <br />
                                <strong>Cell Line:</strong> {original.cell_line}
                                <br />
                                <strong>Algorithm:</strong> {original.algorithm}
                            </p>
                        </>
                    )}
                />
            </div>
        </>
    );
}
