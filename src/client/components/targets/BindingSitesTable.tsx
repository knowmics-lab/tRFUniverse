import { Card } from "react-bootstrap";
import { BindingSite, Target } from "@/types";
import ArrayDataTable from "@/components/ArrayDataTable";
import { Alignment } from "@/components/DataTable";
import BindingSiteContainer from "@/components/targets/BindingSiteContainer";
import { formatInteger, formatNumber } from "@/formatters";

type BindingSitesTableProps = {
    target: Target;
};

function MultiStringView({ text }: { text: string }) {
    const lines = text.split(";");
    return (
        <>
            {lines.map((line, i) => (
                <div key={i}>{line}</div>
            ))}
        </>
    );
}

export default function BindingSitesTable({ target }: BindingSitesTableProps) {
    return (
        <>
            <Card className="mx-4 mt-4 p-3 shadow-lg border-radius-xl bg-white h-100">
                <Card.Header className="pb-0 p-3">
                    <div className="d-flex justify-content-between">
                        <h6 className="mb-2">Binding sites</h6>
                    </div>
                </Card.Header>
                <Card.Body>
                    <ArrayDataTable<BindingSite>
                        data={target.binding_sites}
                        idField="id"
                        columns={[
                            {
                                accessorKey: "transcript_id",
                                header: "Transcript Id",
                                footer: "Transcript Id",
                                cell: (info) => <MultiStringView text={info.getValue() as string} />,
                            },
                            {
                                accessorKey: "transcript_name",
                                header: "Transcript Name",
                                footer: "Transcript Name",
                                cell: (info) => <MultiStringView text={info.getValue() as string} />,
                            },
                            {
                                accessorKey: "position",
                                header: "Position",
                                footer: "Position",
                            },
                            {
                                accessorKey: "start",
                                header: "Start",
                                footer: "Start",
                                enableColumnFilter: false,
                                cell: (info) => formatInteger(info.getValue() as number),
                            },
                            {
                                accessorKey: "end",
                                header: "End",
                                footer: "End",
                                enableColumnFilter: false,
                                cell: (info) => formatInteger(info.getValue() as number),
                            },
                            {
                                accessorKey: "count",
                                header: "Evidences",
                                footer: "Evidences",
                                enableColumnFilter: false,
                                cell: (info) => formatInteger(info.getValue() as number),
                            },
                            {
                                accessorKey: "mfe",
                                header: "MFE",
                                footer: "MFE",
                                enableColumnFilter: false,
                                cell: (info) => formatNumber(info.getValue() as number),
                            },
                        ]}
                        columnsAlignment={{
                            start: Alignment.CENTER,
                            end: Alignment.CENTER,
                            count: Alignment.CENTER,
                            mfe: Alignment.CENTER,
                        }}
                        columnsSizing={{
                            start: "10%",
                            end: "10%",
                            mfe: "10%",
                        }}
                        columnsVisibility={{
                            mfe: "lg",
                        }}
                        expandable
                        renderExpandedRow={({ row }) => {
                            return <BindingSiteContainer bindingSite={row.original} />;
                        }}
                    />
                </Card.Body>
            </Card>
        </>
    );
}
